import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
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
import { DepartmentsService } from './departments.service.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';
import { DepartmentQueryDto } from './dto/department-query.dto.js';
import { Department } from './entities/department.entity.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';

@ApiTags('Departamentos Fincas')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")',
})
@ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin o rrhh ("Unauthorized")' })
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) { }

  @Post()
  @Auth(ValidRoles.rrhh, ValidRoles.admin)
  @ApiOperation({
    summary: 'Crear departamento',
    description: 'Crea un departamento en BioTime. Valida que no exista otro departamento con el mismo código y devuelve los datos enviados.',
  })
  @ApiCreatedResponse({ description: 'Departamento creado', type: CreateDepartmentDto })
  @ApiBadRequestResponse({
    description: 'Datos inválidos (validación del body o propiedades no permitidas), "El departamento con código <dept_code> ya existe" o "Hubo un error al crear el departamento" (fallo en BioTime)',
  })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @Auth(ValidRoles.rrhh, ValidRoles.admin)
  @ApiOperation({
    summary: 'Listar departamentos',
    description: 'Devuelve los departamentos paginados, con filtro opcional por nombre (búsqueda parcial). La respuesta incluye `data`, `total`, `totalPages` y `currentPage`.',
  })
  @ApiPaginatedResponse(Department, 'Listado paginado de departamentos')
  @ApiBadRequestResponse({ description: 'Parámetros de consulta inválidos o no permitidos' })
  findAll(@Query() departmentQueryDto: DepartmentQueryDto) {
    return this.departmentsService.findAll(departmentQueryDto);
  }

  @Get(':id')
  @Auth(ValidRoles.rrhh, ValidRoles.admin)
  @ApiOperation({ summary: 'Obtener departamento', description: 'Devuelve los datos de un departamento por su ID.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del departamento', example: 1 })
  @ApiOkResponse({ description: 'Departamento encontrado', type: Department })
  @ApiBadRequestResponse({ description: 'El ID no es un número entero válido' })
  @ApiNotFoundResponse({ description: 'El departamento con ID <id> no existe' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.rrhh, ValidRoles.admin)
  @ApiOperation({ summary: 'Actualizar departamento', description: 'Actualiza parcialmente el nombre y/o código de un departamento.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del departamento', example: 1 })
  @ApiOkResponse({ description: 'Departamento actualizado', type: Department })
  @ApiBadRequestResponse({
    description: 'El ID no es un número entero válido o datos inválidos (validación del body o propiedades no permitidas)',
  })
  @ApiNotFoundResponse({ description: 'El departamento con ID <id> no existe' })
  @ApiInternalServerErrorResponse({ description: 'Error inesperado de base de datos' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.rrhh, ValidRoles.admin)
  @ApiOperation({
    summary: 'Eliminar departamento',
    description: 'Elimina un departamento siempre que no tenga empleados asignados.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del departamento', example: 1 })
  @ApiOkResponse({
    description: 'Departamento eliminado',
    schema: { type: 'string', example: 'Departamento eliminado correctamente' },
  })
  @ApiBadRequestResponse({
    description: 'El ID no es un número entero válido o "El departamento cuenta con empleados asignados, no se puede eliminar"',
  })
  @ApiNotFoundResponse({ description: 'El departamento con ID <id> no existe' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.remove(id);
  }
}
