import { AccLevelEmployee } from '../acc-level/entities/acc_level_employee.js';
import { AccLevelEmployeeResource } from '../acc-level/resources/acc_level_employee.resource.js';
import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { DatabaseHelpers } from '../common/providers/database-helpers.js';
import { DateHandlerService } from '../common/services/date-handler.service.js';
import { EmailService } from '../common/services/email.service.js';
import { Employee } from './entities/employee.entity.js';
import { EmployeeResource } from './resources/employee.resource.js';
import { EmployeesQueryDto } from './dto/employees-query.dto.js';
import { Filters } from '../common/providers/filters.js';
import { paginate } from '../common/helpers/paginate.js';
import { imageToBase64 } from '../common/helpers/base-64-enconder.js';
import { inactivateEmployeeEmail } from '../common/emails/inactivate-employee.email.js';
import { InjectDisk, StorageDisk } from '@nestjs/storage';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity.js';
import { ZkBioaccessService } from './services/zkbioaccess.service.js';
import { PositionService } from '../position/position.service.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { InactiveEmployeesService } from '../inactive-employees/inactive-employees.service.js';
import { PhotosService } from '../photos/photos.service.js';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee, MSSQL_CONNECTION)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(AccLevelEmployee, MSSQL_CONNECTION)
    private readonly accLevelEmployeeRepository: Repository<AccLevelEmployee>,

    private readonly filters: Filters,
    private readonly databaseHelpers: DatabaseHelpers,
    private readonly dateHandler: DateHandlerService,
    private readonly zkBioaccessService: ZkBioaccessService,
    private readonly emailService: EmailService,
    private readonly positionService: PositionService,
    private readonly inactiveEmployeeService: InactiveEmployeesService,
    private readonly photosService: PhotosService,

    @InjectDisk('photos')
    private readonly photos: StorageDisk,
  ) { }

  async create(createEmployeeDto: CreateEmployeeDto, file: any, user: User) {
    try {
      const exists = await this.employeeRepository.findOneBy({ pin: createEmployeeDto.pin });
      if (exists) throw new BadRequestException(`El empleado con código ${createEmployeeDto.pin} ya existe`);

      const position = await this.positionService.validatePosition(createEmployeeDto.position_id);

      await this.saveInZkBioaccess(createEmployeeDto, file, user);

      const employee = await this.findOneByPin(createEmployeeDto.pin);
      await this.employeeRepository.update({ id: employee.id }, { position_id: position.id });

      return 'Empleado Creado Correctamente';
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException('Hubo un error');
    }
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto, file: any, user: User) {
    try {
      const employee = await this.employeeRepository.findOneBy({ id });
      if (!employee) throw new NotFoundException(`El usuario con ID ${id} no existe`);

      const position = await this.positionService.validatePosition(updateEmployeeDto.position_id, employee.id);

      await this.saveInZkBioaccess({ ...updateEmployeeDto, pin: employee.pin }, file, user);

      await this.employeeRepository.update({ id: employee.id }, { position_id: position.id });

      return 'Empleado Actualizado Correctamente';
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException('Hubo un error');
    }
  }

  async createOrUpdateWithPosition(createEmployeeDto: CreateEmployeeDto, image?: string) {
    const current = await this.employeeRepository.findOneBy({ pin: createEmployeeDto.pin });
    const position = await this.positionService.validatePosition(createEmployeeDto.position_id, current?.id);

    const flag = await this.zkBioaccessService.createOrUpdateEmployee(createEmployeeDto, image);

    const employee = current ?? await this.findOneByPin(createEmployeeDto.pin);
    await this.employeeRepository.update({ id: employee.id }, { position_id: position.id });

    return flag;
  }

  async findAll(employeesQueryDto: EmployeesQueryDto) {
    const { limit = 10, offset = 0 } = employeesQueryDto;
    const where = this.filters.buildWhere<Employee, EmployeesQueryDto>(employeesQueryDto, { like: ['name'] });

    const [employees, total] = await this.employeeRepository.findAndCount({
      take: limit,
      skip: offset,
      where,
      relations: { position: true }
    });

    return paginate(EmployeeResource.collection(employees), total, limit, offset);
  }

  async getAll() {
    const employees = await this.employeeRepository.find();
    return employees;
  }

  async findOne(id: string) {
    const employee = await this.employeeRepository.findOne({ where: { id }, relations: { position: true } });

    if (!employee) throw new NotFoundException(`El usuario con ID ${id} no existe`);

    return EmployeeResource.employeeList(employee);
  }

  async findOneRaw(id: string) {
    const employee = await this.employeeRepository.findOneBy({ id });
    if (!employee) throw new NotFoundException(`El usuario con ID ${id} no existe`);
    return employee;
  }

  async existsByPin(pin: string) {
    return this.employeeRepository.existsBy({ pin });
  }

  async findOneByPin(pin: string) {
    const employee = await this.employeeRepository.findOneBy({ pin });
    if (!employee) throw new NotFoundException(`El usuario con código ${pin} no existe`);
    return employee;
  }

  async remove(pin: string, user: User) {
    const employee = await this.findOneByPin(pin);
    await this.inactiveEmployeeById(employee.id, user);
    await this.inactiveEmployeeService.remove(pin);
    await this.photos.delete(`${pin}.jpg`);
    return 'Empleado Dado de baja permanentemente';
  }

  async updateEmployeePhoto(pin: string, file: any) {
    await this.findOneByPin(pin);
    const base64 = imageToBase64(file);
    const flag = await this.zkBioaccessService.updateEmployeePhoto(pin, base64);

    if (!flag) throw new BadRequestException("Hubo un error al actualizar la foto del empleado, asegurese que el rostro aparezca dentro de la misma");
    await this.photos.put(`${pin}.jpg`, file.buffer, { contentType: file.mimetype });

    return 'Foto actualizada correctamente';
  }

  async getEmployeeLevels(id: string) {
    const employeeLevels = await this.accLevelEmployeeRepository.find({ where: { pers_person_id: id } });
    return AccLevelEmployeeResource.accLevelEmployeeCollection(employeeLevels);
  }

  async inactiveEmployeeById(id: string, user: User) {
    try {
      const employee = await this.findOne(id);
      await this.zkBioaccessService.inactivateEmployee({ pin: employee.pin, leaveType: 1, leaveDate: this.dateHandler.getCurrentDate() });

      this.emailService.sendMail('Baja de Empleado', inactivateEmployeeEmail({
        pin: employee.pin,
        last_name: employee.last_name,
        name: employee.name,
        leave_date: this.dateHandler.getCurrentDate(),
        created_at: this.dateHandler.getCurrentDate(),
        department: employee.department,
        updater_name: user.name,
        updater_username: user.email
      }))
      return 'Empleado dado de baja correctamente.'
    } catch (error) {
      this.databaseHelpers.handleExeptions(error);
    }
  }

  private async saveInZkBioaccess(createEmployeeDto: CreateEmployeeDto, file: any, user: User) {
    const base64 = file ? imageToBase64(file) : undefined;
    const flag = await this.zkBioaccessService.createOrUpdateEmployee(createEmployeeDto, base64);
    if (!flag && file) throw new BadRequestException("Hubo un error al guardar la foto del empleado, asegurese que el rostro aparezca dentro de la misma");
    if (file) {
      await this.photosService.create({ code: createEmployeeDto.pin }, user, file);
    }
  }
}
