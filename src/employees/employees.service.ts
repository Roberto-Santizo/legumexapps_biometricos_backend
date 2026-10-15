import { AccLevelEmployee } from '../acc-level/entities/acc_level_employee.js';
import { AccLevelEmployeeResource } from '../acc-level/resources/acc_level_employee.resource.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { DatabaseHelpers } from '../common/providers/database-helpers.js';
import { DateHandlerService } from '../common/services/date-handler.service.js';
import { Employee } from './entities/employee.entity.js';
import { EmployeeResource } from './resources/employee.resource.js';
import { EmployeesQueryDto } from './dto/employees-query.dto.js';
import { Filters } from '../common/providers/filters.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity.js';
import { ZkBioaccessService } from './services/zkbioaccess.service.js';

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
  ) { }

  async create(createEmployeeDto: CreateEmployeeDto, user: User) {
    try {
      await this.zkBioaccessService.createOrUpdateEmployee(createEmployeeDto);

      return 'Empleado Creado/Actulizado Correctamente';
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
      where,
    });

    return EmployeeResource.collection(employees);
  }

  async findOne(id: string) {
    const employee = await this.employeeRepository.findOneBy({ id });

    if (!employee) throw new NotFoundException(`El usuario con ID ${id} no existe`);

    return employee;
  }

  async getEmployeeLevels(id: string) {
    const employeeLevels = await this.accLevelEmployeeRepository.find({ where: { pers_person_id: id } });
    return AccLevelEmployeeResource.accLevelEmployeeCollection(employeeLevels);
  }

  async inactiveEmployeeById(id: string) {
    try {
      const employee = await this.findOne(id);
      await this.zkBioaccessService.inactivateEmployee({ pin: employee.pin, leaveType: 1, leaveDate: this.dateHandler.getCurrentDate() });
      return 'Empleado dado de baja correctamente.'

    } catch (error) {
      this.databaseHelpers.handleExeptions(error);
    }
  }
}
