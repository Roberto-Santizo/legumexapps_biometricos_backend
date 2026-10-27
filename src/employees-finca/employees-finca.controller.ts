import { Auth } from '../auth/decorators/auth.decorator.js';
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
import { CreateEmployeesFincaDto } from './dto/create-employees-finca.dto.js';
import { EmployeesFincaService } from './employees-finca.service.js';
import { EmployeesFincasQueryDto } from './dto/employee-fincas-query.dto.js';
import { UpdateEmployeesFincaDto } from './dto/update-employees-finca.dto.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';
import { AddAreaEmployeeDto } from './dto/add-area-employee.dto.js';
import { EmployeeFincaDetailResponse, EmployeeFincaListResponse } from './resources/employee-finca.response.js';

@ApiTags('Empleados Fincas')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")',
})
@ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin o fincas ("Unauthorized")' })
@Controller('employees-finca')
export class EmployeesFincaController {
  constructor(private readonly employeesFincaService: EmployeesFincaService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  @ApiOperation({
    summary: 'Crear empleado',
    description: 'Crea el empleado en BioTime (/personnel/api/employees/) asignándole automáticamente el siguiente código de empleado disponible (`emp_code` más alto + 1) y `company = 1`.',
  })
  @ApiCreatedResponse({
    description: 'Empleado creado en BioTime',
    schema: { type: 'string', example: 'Empleado Creado Correctamente' },
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos (validación del body o propiedades no permitidas) o BioTime rechazó la creación ("Hubo un error al crear el empleado")',
  })
  create(@Body() createEmployeesFincaDto: CreateEmployeesFincaDto) {
    return this.employeesFincaService.create(createEmployeesFincaDto);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  @ApiOperation({
    summary: 'Listar empleados',
    description: 'Devuelve los empleados de fincas paginados, con filtros opcionales por nombres, apellidos, código y posición (búsqueda parcial). La respuesta incluye `data`, `total`, `totalPages` y `currentPage`.',
  })
  @ApiPaginatedResponse(EmployeeFincaListResponse, 'Listado paginado de empleados')
  @ApiBadRequestResponse({ description: 'Parámetros de consulta inválidos o no permitidos' })
  findAll(@Query() employeesFincasQueryDto: EmployeesFincasQueryDto) {
    return this.employeesFincaService.findAll(employeesFincasQueryDto);
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  @ApiOperation({
    summary: 'Obtener empleado',
    description: 'Devuelve el detalle de un empleado de fincas, incluyendo las áreas asignadas.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del empleado', example: 125 })
  @ApiOkResponse({ description: 'Detalle del empleado', type: EmployeeFincaDetailResponse })
  @ApiBadRequestResponse({ description: 'El `id` no es un número entero' })
  @ApiNotFoundResponse({ description: 'El empleado no existe ("El empleado con ID <id> no existe")' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeesFincaService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  @ApiOperation({
    summary: 'Actualizar empleado',
    description: 'Actualiza parcialmente el empleado en BioTime (/personnel/api/employees/<id>/). Todos los campos del body son opcionales; solo se envían los campos incluidos.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del empleado', example: 125 })
  @ApiOkResponse({
    description: 'Empleado actualizado en BioTime',
    schema: { type: 'string', example: 'Empleado actualizado correctamente' },
  })
  @ApiBadRequestResponse({
    description: 'El `id` no es un número entero, datos inválidos (validación del body o propiedades no permitidas) o BioTime rechazó la actualización ("Hubo un error al actualizar el empleado")',
  })
  @ApiNotFoundResponse({ description: 'El empleado no existe ("El empleado con ID <id> no existe")' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEmployeesFincaDto: UpdateEmployeesFincaDto) {
    return this.employeesFincaService.update(id, updateEmployeesFincaDto);
  }

  @Post('/resignEmployee/:id')
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  @ApiOperation({
    summary: 'Dar de baja empleado',
    description: 'Da de baja al empleado en BioTime (/personnel/api/employees/adjust_resign/) con la fecha actual y deshabilita su asistencia.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del empleado', example: 125 })
  @ApiCreatedResponse({
    description: 'Empleado dado de baja',
    schema: { type: 'string', example: 'Empleado dado de baja correctamente' },
  })
  @ApiBadRequestResponse({
    description: 'El `id` no es un número entero, el empleado ya está dado de baja ("El empleado ya se encuentra dado de baja") o BioTime rechazó la operación ("Hubo un error al dar de baja al empleado")',
  })
  @ApiNotFoundResponse({ description: 'El empleado no existe ("El empleado con ID <id> no existe")' })
  resignEmployee(@Param('id', ParseIntPipe) id: number) {
    return this.employeesFincaService.resignEmployee(id);
  }

  @Post('/reinstatmentEmployee/:id')
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  @ApiOperation({
    summary: 'Dar de alta empleado',
    description: 'Reincorpora en BioTime (/personnel/api/resigns/reinstatement/) a un empleado que se encuentra dado de baja.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del empleado', example: 125 })
  @ApiCreatedResponse({
    description: 'Empleado dado de alta',
    schema: { type: 'string', example: 'Empleado dado de alta correctamente' },
  })
  @ApiBadRequestResponse({
    description: 'El `id` no es un número entero, el empleado no está dado de baja ("El empleado no se encuentra dado de baja") o BioTime rechazó la operación ("Hubo un error al dar de alta al empleado")',
  })
  @ApiNotFoundResponse({ description: 'El empleado no existe ("El empleado con ID <id> no existe")' })
  reinstatment(@Param('id', ParseIntPipe) id: number) {
    return this.employeesFincaService.reinstatmentEmployee(id);
  }

  @Post('/addEmployeeArea')
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  @ApiOperation({
    summary: 'Asignar área a empleado',
    description: 'Asigna un área de fincas a un empleado existente.',
  })
  @ApiCreatedResponse({
    description: 'Área asignada',
    schema: { type: 'string', example: 'Area Agregada Correctamente' },
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos (validación del body o propiedades no permitidas)' })
  @ApiNotFoundResponse({ description: 'El empleado no existe ("El empleado con ID <employee_id> no existe")' })
  @ApiInternalServerErrorResponse({ description: 'Error al guardar la asignación (por ejemplo, el área no existe)' })
  addEmployeeArea(@Body() addEmployeeAreaDto: AddAreaEmployeeDto) {
    return this.employeesFincaService.addEmployeeArea(addEmployeeAreaDto);
  }

  @Delete('/deleteEmployeeArea/:id')
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  @ApiOperation({
    summary: 'Desasignar área de empleado',
    description: 'Elimina la asignación área-empleado indicada.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la asignación área-empleado', example: 15 })
  @ApiOkResponse({
    description: 'Área desasignada',
    schema: { type: 'string', example: 'Area desasignada correctamente' },
  })
  @ApiBadRequestResponse({ description: 'El `id` no es un número entero' })
  @ApiNotFoundResponse({ description: 'La asignación no existe ("El area-empleado con id <id> no existe")' })
  deleteAreaFincaEmployee(@Param('id', ParseIntPipe) id: number) {
    return this.employeesFincaService.deleteEmployeeArea(id);
  }
}
