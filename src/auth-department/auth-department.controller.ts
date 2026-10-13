import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AuthDepartmentService } from './auth-department.service.js';
import { CreateAuthDepartmentDto } from './dto/create-auth-department.dto.js';
import { UpdateAuthDepartmentDto } from './dto/update-auth-department.dto.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';
import { AuthDepartmentQueryDto } from './dto/auth-department-query.dto.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { User } from '../auth/entities/user.entity.js';

@Controller('auth-department')
export class AuthDepartmentController {
  constructor(private readonly authDepartmentService: AuthDepartmentService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  create(@Body() createAuthDepartmentDto: CreateAuthDepartmentDto, @GetUser() user: User) {
    return this.authDepartmentService.create(createAuthDepartmentDto, user);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  findAll(@Query() authDepartmentQueryDto: AuthDepartmentQueryDto) {
    return this.authDepartmentService.findAll(authDepartmentQueryDto);
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  findOne(@Param('id') id: string) {
    return this.authDepartmentService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  update(@Param('id') id: string, @Body() updateAuthDepartmentDto: UpdateAuthDepartmentDto, @GetUser() user: User) {
    return this.authDepartmentService.update(id, updateAuthDepartmentDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  remove(@Param('id') id: string) {
    return this.authDepartmentService.remove(id);
  }
}
