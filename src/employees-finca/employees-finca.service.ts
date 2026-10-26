import { CreateEmployeesFincaDto } from './dto/create-employees-finca.dto.js';
import { EmployeesFinca } from './entities/employees-finca.entity.js';
import { EmployeesFincasQueryDto } from './dto/employee-fincas-query.dto.js';
import { Filters } from '../common/providers/filters.js';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_FINCAS_CONNECTION } from '../common/constants/connections.js';
import { paginate } from '../common/helpers/paginate.js';
import { Repository } from 'typeorm';
import { UpdateEmployeesFincaDto } from './dto/update-employees-finca.dto.js';
import { EmployeeFincaResource } from './resources/employee-finca.resource.js';
import { BiotimeService } from '../biometrics/services/biotime.service.js';
import { EmployeeResign } from './entities/employee-resign.entity.js';

@Injectable()
export class EmployeesFincaService {
  constructor(
    @InjectRepository(EmployeesFinca, MSSQL_FINCAS_CONNECTION)
    private readonly employeesFincaRepository: Repository<EmployeesFinca>,

    @InjectRepository(EmployeeResign, MSSQL_FINCAS_CONNECTION)
    private readonly employeesFincaResignRepository: Repository<EmployeeResign>,

    private readonly biotimeService: BiotimeService,

    private readonly filters: Filters
  ) { }


  async create(createEmployeesFincaDto: CreateEmployeesFincaDto) {
    const code = await this.getLastCode();
    await this.biotimeService.createEmployee(createEmployeesFincaDto, code);
    return 'Empleado Creado Correctamente';
  }

  async findAll(employeesFincasQueryDto: EmployeesFincasQueryDto) {
    const { limit = 10, offset = 0 } = employeesFincasQueryDto;
    const where = this.filters.buildWhere<EmployeesFinca, EmployeesFincasQueryDto>(employeesFincasQueryDto, { like: ['first_name', 'last_name', 'position_id', 'emp_code'] });

    const [employees, total] = await this.employeesFincaRepository.findAndCount({
      take: limit,
      skip: offset,
      where
    });

    return paginate(EmployeeFincaResource.collection(employees), total, limit, offset);
  }

  async findOne(id: number) {
    const employee = await this.employeesFincaRepository.findOne({ where: { id }, relations: { areas: true, } });
    if (!employee) throw new NotFoundException(`El empleado con ID ${id} no existe`);

    return EmployeeFincaResource.employeeDetails(employee);
  }

  async findRawOne(id: number) {
    const employee = await this.employeesFincaRepository.findOne({ where: { id }, relations: { areas: true, } });
    if (!employee) throw new NotFoundException(`El empleado con ID ${id} no existe`);

    return employee;
  }


  async update(id: number, updateEmployeesFincaDto: UpdateEmployeesFincaDto) {
    return `This action updates a #${id} employeesFinca`;
  }

  async resignEmployee(id: number) {
    const employee = await this.findRawOne(id);

    if (!employee) throw new NotFoundException(`El empleado con ID ${id} no existe`);
    if (employee.resign != null) throw new BadRequestException(`El empleado ya se encuentra dado de baja`);

    const message = await this.biotimeService.resignEmployee(id);

    return message;
  }

  async reinstatmentEmployee(id: number) {
    const employee = await this.findRawOne(id);
    if (employee.resign == null) throw new BadRequestException(`El empleado no se encuentra dado de baja`);

    const message = await this.biotimeService.reinstatmentEmployee(id);

    return message;
  }

  private async getLastCode() {
    const { emp_code } = await this.employeesFincaRepository
      .createQueryBuilder('employee')
      .select('employee.emp_code', 'emp_code')
      .orderBy('CAST(employee.emp_code AS INTEGER)', 'DESC')
      .getRawOne();

    return (+emp_code) + 1;
  }
}
