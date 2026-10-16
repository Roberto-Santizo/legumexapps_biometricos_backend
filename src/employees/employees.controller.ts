import { Auth } from '../auth/decorators/auth.decorator.js';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
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
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { EmployeesQueryDto } from './dto/employees-query.dto.js';
import { EmployeesService } from './employees.service.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { User } from '../auth/entities/user.entity.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';
import { Employee } from './entities/employee.entity.js';
import { EmployeeListResponse } from './resources/employee.response.js';
import { AccLevelEmployeeResponse } from '../acc-level/resources/acc-level.response.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFilter } from '../common/helpers/image-filter.js';
import { type FileInterface } from '../common/interfaces/index.js';

@ApiTags('Empleados')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")',
})
@ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin o rrhh ("Unauthorized")' })
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Crear o actualizar empleado',
    description: 'Envía el empleado a la API de ZKBioAccess (/person/add), que lo crea o lo actualiza si el PIN ya existe.',
  })
  @ApiCreatedResponse({
    description: 'Empleado enviado a ZKBioAccess correctamente',
    schema: { type: 'string', example: 'Empleado Creado/Actulizado Correctamente' },
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos (validación del body o propiedades no permitidas)' })
  @ApiInternalServerErrorResponse({
    description: 'Error al comunicarse con ZKBioAccess o al crear/actualizar el empleado ("Please check server logs")',
  })
  create(@Body() createEmployeeDto: CreateEmployeeDto, @GetUser() user: User) {
    return this.employeesService.create(createEmployeeDto, user);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Listar empleados',
    description: 'Devuelve los empleados paginados, con filtro opcional por nombre (búsqueda parcial).',
  })
  @ApiOkResponse({ description: 'Listado de empleados', type: [EmployeeListResponse] })
  @ApiBadRequestResponse({ description: 'Parámetros de consulta inválidos o no permitidos' })
  findAll(@Query() employeesQueryDto: EmployeesQueryDto) {
    return this.employeesService.findAll(employeesQueryDto);
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Obtener empleado',
    description: 'Devuelve los datos de un empleado por su ID, incluyendo su departamento.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del empleado (32 caracteres)',
    example: '4028898594b7f9660194b7fb5d7a0500',
  })
  @ApiOkResponse({ description: 'Empleado encontrado', type: Employee })
  @ApiNotFoundResponse({ description: 'El usuario con ID <id> no existe' })
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Get('/levels/getEmployeeLevels/:id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Listar niveles de acceso del empleado',
    description: 'Devuelve los niveles de acceso asignados a un empleado. Si el empleado no existe o no tiene niveles, devuelve un arreglo vacío.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del empleado (32 caracteres)',
    example: '4028898594b7f9660194b7fb5d7a0500',
  })
  @ApiOkResponse({ description: 'Niveles de acceso del empleado', type: [AccLevelEmployeeResponse] })
  getEmployeeLevels(@Param('id') id: string) {
    return this.employeesService.getEmployeeLevels(id);
  }

  @Post('/status/inactiveEmployee/:id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Dar de baja empleado',
    description: 'Busca el empleado por ID y lo da de baja en ZKBioAccess (/person/leave) con tipo de baja 1 y la fecha actual.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del empleado (32 caracteres)',
    example: '4028898594b7f9660194b7fb5d7a0500',
  })
  @ApiCreatedResponse({
    description: 'Empleado dado de baja correctamente',
    schema: { type: 'string', example: 'Empleado dado de baja correctamente.' },
  })
  @ApiInternalServerErrorResponse({
    description: 'El empleado no existe o hubo un error al comunicarse con ZKBioAccess ("Please check server logs")',
  })
  inactiveEmployeeById(@Param('id') id: string, @GetUser() user: User) {
    return this.employeesService.inactiveEmployeeById(id, user);
  }

  @Post('/updateEmployeePhoto/:id')
  // @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @UseInterceptors(FileInterceptor('file', { fileFilter: imageFilter }))
  updateEmployeePhoto(@UploadedFile() file: FileInterface, @Param('id') id: string) {
    if (!file) throw new BadRequestException("Make sure that the file exists and is an image");
    return this.employeesService.updateEmployeePhoto(id, file);
  }
}
