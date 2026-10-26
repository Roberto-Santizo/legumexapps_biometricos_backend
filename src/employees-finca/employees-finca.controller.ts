import { Auth } from '../auth/decorators/auth.decorator.js';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { CreateEmployeesFincaDto } from './dto/create-employees-finca.dto.js';
import { EmployeesFincaService } from './employees-finca.service.js';
import { EmployeesFincasQueryDto } from './dto/employee-fincas-query.dto.js';
import { UpdateEmployeesFincaDto } from './dto/update-employees-finca.dto.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';
import { AddAreaEmployeeDto } from './dto/add-area-employee.dto.js';

@Controller('employees-finca')
export class EmployeesFincaController {
  constructor(private readonly employeesFincaService: EmployeesFincaService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  create(@Body() createEmployeesFincaDto: CreateEmployeesFincaDto) {
    return this.employeesFincaService.create(createEmployeesFincaDto);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  findAll(@Query() employeesFincasQueryDto: EmployeesFincasQueryDto) {
    return this.employeesFincaService.findAll(employeesFincasQueryDto);
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeesFincaService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEmployeesFincaDto: UpdateEmployeesFincaDto) {
    return this.employeesFincaService.update(id, updateEmployeesFincaDto);
  }

  @Post('/resignEmployee/:id')
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  resignEmployee(@Param('id', ParseIntPipe) id: number) {
    return this.employeesFincaService.resignEmployee(id);
  }

  @Post('/reinstatmentEmployee/:id')
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  reinstatment(@Param('id', ParseIntPipe) id: number) {
    return this.employeesFincaService.reinstatmentEmployee(id);
  }

  @Post('/addEmployeeArea')
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  addEmployeeArea(@Body() addEmployeeAreaDto: AddAreaEmployeeDto) {
    return this.employeesFincaService.addEmployeeArea(addEmployeeAreaDto);
  }

  @Delete('/deleteEmployeeArea/:id')
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  deleteAreaFincaEmployee(@Param('id', ParseIntPipe) id: number) {
    return this.employeesFincaService.deleteEmployeeArea(id);
  }
}
