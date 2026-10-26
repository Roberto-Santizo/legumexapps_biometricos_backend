import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { DepartmentsService } from './departments.service.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';
import { DepartmentQueryDto } from './dto/department-query.dto.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) { }

  @Post()
  @Auth(ValidRoles.rrhh, ValidRoles.admin)
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @Auth(ValidRoles.rrhh, ValidRoles.admin)
  findAll(@Query() departmentQueryDto: DepartmentQueryDto) {
    return this.departmentsService.findAll(departmentQueryDto);
  }

  @Get(':id')
  @Auth(ValidRoles.rrhh, ValidRoles.admin)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.rrhh, ValidRoles.admin)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.rrhh, ValidRoles.admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.remove(id);
  }
}
