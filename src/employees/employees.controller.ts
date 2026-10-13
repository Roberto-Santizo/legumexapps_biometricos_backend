import { Auth } from '../auth/decorators/auth.decorator.js';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { EmployeesQueryDto } from './dto/employees-query.dto.js';
import { EmployeesService } from './employees.service.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { User } from '../auth/entities/user.entity.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  create(@Body() createEmployeeDto: CreateEmployeeDto, @GetUser() user: User) {
    return this.employeesService.create(createEmployeeDto, user);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  findAll(@Query() employeesQueryDto: EmployeesQueryDto) {
    return this.employeesService.findAll(employeesQueryDto);
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto, @GetUser() user: User) {
    return this.employeesService.update(id, updateEmployeeDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  remove(@Param('id') id: string) {
    return this.employeesService.remove(+id);
  }
}
