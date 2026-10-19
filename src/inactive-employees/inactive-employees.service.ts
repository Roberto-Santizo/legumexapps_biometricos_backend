import { InactiveEmployee } from './entities/inactive-employee.entity.js';
import { InactiveEmployeeResource } from './resources/inactive-employee.resource.js';
import { Injectable, NotFoundException } from '@nestjs/common';
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
  constructor(
    @InjectRepository(InactiveEmployee, MSSQL_CONNECTION)
    private readonly inactiveEmployeeRepository: Repository<InactiveEmployee>,

    private readonly zkBioaccessService: ZkBioaccessService,
    private readonly databaseHelpers: DatabaseHelpers,
    private readonly filters: Filters
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

  async reActivateEmployeeById(id: string) {
    try {
      const employee = await this.findOne(id);
      await this.zkBioaccessService.reActivateEmployee(employee.pin);
      return 'Empleado dado de alta correctamente.'
    } catch (error) {
      this.databaseHelpers.handleExeptions(error);
    }
  }
}
