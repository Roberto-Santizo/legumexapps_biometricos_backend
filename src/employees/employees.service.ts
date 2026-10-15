import { AuthDepartmentService } from '../auth-department/auth-department.service.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { DatabaseHelpers } from '../common/providers/database-helpers.js';
import { DateHandlerService } from '../common/services/date-handler.service.js';
import { Employee } from './entities/employee.entity.js';
import { EmployeeResource } from './resources/employee.resource.js';
import { EmployeesQueryDto } from './dto/employees-query.dto.js';
import { Filters } from '../common/providers/filters.js';
import { IdGeneratorService } from '../common/services/id-generator.service.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { Repository } from 'typeorm';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { User } from '../auth/entities/user.entity.js';
import { AccLevelEmployee } from '../acc-level/entities/acc_level_employee.js';
import { AccLevelEmployeeResource } from '../acc-level/resources/acc_level_employee.resource.js';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee, MSSQL_CONNECTION)
    private readonly employeeRepository: Repository<Employee>,
    
    @InjectRepository(AccLevelEmployee, MSSQL_CONNECTION)
    private readonly accLevelEmployeeRepository: Repository<AccLevelEmployee>,

    private readonly authDepartmentService: AuthDepartmentService,
    private readonly filters: Filters,
    private readonly databaseHelpers: DatabaseHelpers,
    private readonly idGenerator: IdGeneratorService,
    private readonly dateHandler: DateHandlerService
  ) { }

  async create(createEmployeeDto: CreateEmployeeDto, user: User) {
    try {
      await this.authDepartmentService.findOne(createEmployeeDto.auth_dept_id);
      const employee = this.employeeRepository.create({
        ...createEmployeeDto,
        id: this.idGenerator.generate32CaracterId(),
        creater_code: user.name,
        creater_name: user.name,
        create_time: this.dateHandler.getCurrentDate(),
        enabled_credential: 1,
        exception_flag: 0,
        app_authorization: 1,
        status: 0,
        person_type: 0
      });
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
      where,
    });

    return EmployeeResource.collection(employees);
  }

  async findOne(id: string) {
    const employee = await this.employeeRepository.findOneBy({ id });

    if (!employee) throw new NotFoundException(`El usuario con ID ${id} no existe`);

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto, user: User) {
    try {
      const employee = await this.employeeRepository.preload({
        id,
        ...updateEmployeeDto,
        update_time: this.dateHandler.getCurrentDate(),
        updater_code: user.name,
        updater_name: user.name
      });

      if (!employee) throw new NotFoundException(`El empleado con ID ${id} no existe`);
      await this.employeeRepository.save(employee);

      return employee;
    } catch (error) {
      this.databaseHelpers.handleExeptions(error);
    }
  }

  async getEmployeeLevels(id: string){
    const employeeLevels = await this.accLevelEmployeeRepository.find({ where: { pers_person_id: id } });
    return AccLevelEmployeeResource.accLevelEmployeeCollection(employeeLevels);
  }
}
