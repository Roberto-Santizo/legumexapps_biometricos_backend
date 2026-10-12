import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { DatabaseHelpers } from '../common/providers/database-helpers.js';
import { Employee } from './entities/employee.entity.js';
import { EmployeesQueryDto } from './dto/employees-query.dto.js';
import { Filters } from '../common/providers/filters.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee, MSSQL_CONNECTION)
    private readonly employeeRepository: Repository<Employee>,

    private readonly filters: Filters,
    private readonly databaseHelpers: DatabaseHelpers
  ) { }

  async create(createEmployeeDto: CreateEmployeeDto) {
    try {

      //TODO: FIX THE EMPLOYEE CREATION (AUTH_DEPARTMENT)
      const id = randomUUID().replace(/-/g, '');

      const employee = this.employeeRepository.create({ ...createEmployeeDto, id: id });
      await this.employeeRepository.save(employee);

      return employee;
    } catch (error) {
      this.databaseHelpers.handleExeptions(error);
    }
  }

  async findAll(employeesQueryDto: EmployeesQueryDto) {
    const { limit = 10, offset = 0 } = employeesQueryDto;
    const where = this.filters.buildWhere<Employee, EmployeesQueryDto>(employeesQueryDto, { like: ['name'] });

    const employees = await this.employeeRepository.find({
      take: limit,
      skip: offset,
      where
    });

    return employees;
  }

  async findOne(id: string) {
    const employee = await this.employeeRepository.findOneBy({ id });

    if (!employee) throw new NotFoundException(`El usuario con ID ${id} no existe`);

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    try {
      const employee = await this.employeeRepository.preload({ id, ...updateEmployeeDto });
      if (!employee) throw new NotFoundException(`El empleado con ID ${id} no existe`);
      await this.employeeRepository.save(employee);

      return employee;
    } catch (error) {
      this.databaseHelpers.handleExeptions(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} employee`;
  }
}
