import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../common/decorators/index.js';
import { AuthDepartmentService } from './auth-department.service.js';
import { CreateAuthDepartmentDto } from './dto/create-auth-department.dto.js';
import { UpdateAuthDepartmentDto } from './dto/update-auth-department.dto.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';
import { AuthDepartmentQueryDto } from './dto/auth-department-query.dto.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { User } from '../auth/entities/user.entity.js';
import { AuthDepartment } from './entities/auth-department.entity.js';

@ApiTags('Departamentos')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")',
})
@ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin o rrhh ("Unauthorized")' })
@Controller('auth-department')
export class AuthDepartmentController {
  constructor(private readonly authDepartmentService: AuthDepartmentService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Crear departamento',
    description: 'Crea un nuevo departamento en ZKBioAccess registrando al usuario autenticado como creador.',
  })
  @ApiCreatedResponse({ description: 'Departamento creado', type: AuthDepartment })
  @ApiBadRequestResponse({ description: 'Datos inválidos (validación del body o propiedades no permitidas)' })
  @ApiInternalServerErrorResponse({
    description: 'Error de base de datos, p. ej. código de departamento duplicado ("Please check server logs")',
  })
  create(@Body() createAuthDepartmentDto: CreateAuthDepartmentDto, @GetUser() user: User) {
    return this.authDepartmentService.create(createAuthDepartmentDto, user);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Listar departamentos',
    description: 'Devuelve los departamentos paginados, con filtros opcionales por nombre y código (búsqueda parcial). La respuesta incluye `data`, `total`, `totalPages` y `currentPage`.',
  })
  @ApiPaginatedResponse(AuthDepartment, 'Listado paginado de departamentos')
  @ApiBadRequestResponse({ description: 'Parámetros de consulta inválidos o no permitidos' })
  findAll(@Query() authDepartmentQueryDto: AuthDepartmentQueryDto) {
    return this.authDepartmentService.findAll(authDepartmentQueryDto);
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({ summary: 'Obtener departamento', description: 'Devuelve los datos de un departamento por su ID.' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del departamento (32 caracteres)',
    example: '4028898594b7f9660194b7fb25b00010',
  })
  @ApiOkResponse({ description: 'Departamento encontrado', type: AuthDepartment })
  @ApiNotFoundResponse({ description: 'El departamento con ID <id> no existe' })
  findOne(@Param('id') id: string) {
    return this.authDepartmentService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Actualizar departamento',
    description: 'Actualiza parcialmente un departamento registrando al usuario autenticado como último editor.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del departamento (32 caracteres)',
    example: '4028898594b7f9660194b7fb25b00010',
  })
  @ApiOkResponse({ description: 'Departamento actualizado', type: AuthDepartment })
  @ApiBadRequestResponse({ description: 'Datos inválidos (validación del body o propiedades no permitidas)' })
  @ApiNotFoundResponse({ description: 'El departamento con ID <id> no existe' })
  @ApiInternalServerErrorResponse({ description: 'Error de base de datos, p. ej. código de departamento duplicado' })
  update(@Param('id') id: string, @Body() updateAuthDepartmentDto: UpdateAuthDepartmentDto, @GetUser() user: User) {
    return this.authDepartmentService.update(id, updateAuthDepartmentDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({ summary: 'Eliminar departamento', description: 'Elimina un departamento por su ID.' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del departamento (32 caracteres)',
    example: '4028898594b7f9660194b7fb25b00010',
  })
  @ApiOkResponse({ description: 'Departamento eliminado (respuesta sin cuerpo)' })
  @ApiNotFoundResponse({ description: 'El departamento con ID <id> no existe' })
  @ApiInternalServerErrorResponse({
    description: 'Error de base de datos, p. ej. el departamento tiene empleados asociados',
  })
  remove(@Param('id') id: string) {
    return this.authDepartmentService.remove(id);
  }
}
