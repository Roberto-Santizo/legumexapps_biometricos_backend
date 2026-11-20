import { InactiveEmployee } from './entities/inactive-employee.entity.js';
import { InactiveEmployeeResource } from './resources/inactive-employee.resource.js';
import { HttpException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { imageBufferToBase64 } from '../common/helpers/base-64-enconder.js';
import { PhotosService } from '../photos/photos.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { Repository } from 'typeorm';
import { ZkBioaccessService } from '../employees/services/zkbioaccess.service.js';
import { DatabaseHelpers } from '../common/providers/database-helpers.js';
import { InactiveEmployeesQueryDto } from './dto/inactive-employees-query.dto.js';
import { Filters } from '../common/providers/filters.js';
import { paginate } from '../common/helpers/paginate.js';

@Injectable()
export class InactiveEmployeesService {
  private readonly logger = new Logger(InactiveEmployeesService.name);

  constructor(
    @InjectRepository(InactiveEmployee, MSSQL_CONNECTION)
    private readonly inactiveEmployeeRepository: Repository<InactiveEmployee>,

    private readonly zkBioaccessService: ZkBioaccessService,
    private readonly databaseHelpers: DatabaseHelpers,
    private readonly filters: Filters,
    private readonly photosService: PhotosService
  ) { }


  async findAll(inactiveEmployeesQueryDto: InactiveEmployeesQueryDto) {
    const { limit = 10, offset = 0 } = inactiveEmployeesQueryDto;
    const where = this.filters.buildWhere<InactiveEmployee, InactiveEmployeesQueryDto>(inactiveEmployeesQueryDto, { like: ['name'] });

    const [inactiveEmployees, total] = await this.inactiveEmployeeRepository.findAndCount({
      take: limit,
      skip: offset,
      where
    });
    return paginate(InactiveEmployeeResource.inactiveEmployeeCollection(inactiveEmployees), total, limit, offset);
  }

  async findOne(id: string) {
    const inactiveEmployee = await this.inactiveEmployeeRepository.findOne({ where: { id } });
    if (!inactiveEmployee) throw new NotFoundException(`El empleado con ID ${id} no existe`);
    return InactiveEmployeeResource.inactiveEmployeeDetailResource(inactiveEmployee);
  }

  async findOneByPin(pin: string) {
    const inactiveEmployee = await this.inactiveEmployeeRepository.findOne({ where: { pin } });
    if (!inactiveEmployee) throw new NotFoundException(`El empleado con código ${pin} no existe`);
    return inactiveEmployee;
  }

  async reActivateEmployeeById(id: string) {
    try {
      const employee = await this.findOne(id);
      const warning = await this.reActivateWithPhoto(employee.pin);
      return warning ? `Empleado dado de alta correctamente. Alerta: ${warning}` : 'Empleado dado de alta correctamente.';
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.databaseHelpers.handleExeptions(error);
    }
  }

  async reActivateWithPhoto(pin: string): Promise<string | null> {
    await this.zkBioaccessService.reActivateEmployee(pin);

    const image = await this.photosService.findBuffer(pin);
    if (!image) return this.warn(`El empleado ${pin} fue reactivado sin foto porque no tiene una foto cargada; el biométrico no lo reconocerá hasta que se le asigne una`);

    try {
      await this.zkBioaccessService.updateEmployeePhoto(pin, imageBufferToBase64(image));
      return null;
    } catch (error) {
      return this.warn(`El empleado ${pin} fue reactivado pero no se pudo enviar su foto al biométrico: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private warn(message: string) {
    this.logger.warn(message);
    return message;
  }

  async remove(pin: string) {
    const inactiveEmployee = await this.findOneByPin(pin);
    await this.inactiveEmployeeRepository.delete({ id: inactiveEmployee.id });
  }
}
