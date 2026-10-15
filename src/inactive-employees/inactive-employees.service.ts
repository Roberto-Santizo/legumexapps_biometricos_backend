import { InactiveEmployee } from './entities/inactive-employee.entity.js';
import { InactiveEmployeeResource } from './resources/inactive-employee.resource.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { Repository } from 'typeorm';
import { ZkBioaccessService } from '../employees/services/zkbioaccess.service.js';
import { DatabaseHelpers } from '../common/providers/database-helpers.js';

@Injectable()
export class InactiveEmployeesService {
  constructor(
    @InjectRepository(InactiveEmployee, MSSQL_CONNECTION)
    private readonly inactiveEmployeeRepository: Repository<InactiveEmployee>,

    private readonly zkBioaccessService: ZkBioaccessService,
    private readonly databaseHelpers: DatabaseHelpers,
  ) { }


  async findAll() {
    const inactiveEmployees = await this.inactiveEmployeeRepository.find();
    return InactiveEmployeeResource.inactiveEmployeeCollection(inactiveEmployees);
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
