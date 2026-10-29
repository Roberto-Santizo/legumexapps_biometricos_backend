import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../common/decorators/index.js';
import { PositionService } from './position.service.js';
import { CreatePositionDto } from './dto/create-position.dto.js';
import { UpdatePositionDto } from './dto/update-position.dto.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { User } from '../auth/entities/user.entity.js';
import { PositionQueryDto } from './dto/position-query.dto.js';
import { Position } from './entities/position.entity.js';
import { Employee } from '../employees/entities/employee.entity.js';
import { PositionResponse } from './resources/position.response.js';

@ApiTags('Posiciones')
@ApiExtraModels(Employee)
@Controller('position')
export class PositionController {
  constructor(private readonly positionService: PositionService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear posición',
    description: 'Crea una nueva posición registrando al usuario autenticado como creador.',
  })
  @ApiCreatedResponse({ description: 'Posición creada', type: Position })
  @ApiBadRequestResponse({
    description: 'Datos inválidos (validación del body o propiedades no permitidas) o la posición con código <code> ya existe',
  })
  @ApiUnauthorizedResponse({
    description: 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")',
  })
  @ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin o rrhh ("Unauthorized")' })
  create(@Body() createPositionDto: CreatePositionDto, @GetUser() user: User) {
    return this.positionService.create(createPositionDto, user);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar posiciones',
    description: 'Devuelve las posiciones paginadas, con filtros opcionales por nombre y código (búsqueda parcial). La respuesta incluye `data`, `total`, `totalPages` y `currentPage`.',
  })
  @ApiPaginatedResponse(PositionResponse, 'Listado paginado de posiciones')
  @ApiBadRequestResponse({ description: 'Parámetros de consulta inválidos o no permitidos' })
  @ApiUnauthorizedResponse({
    description: 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")',
  })
  @ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin o rrhh ("Unauthorized")' })
  findAll(@Query() positionQueryDto: PositionQueryDto) {
    return this.positionService.findAll(positionQueryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener posición', description: 'Devuelve los datos de una posición por su ID, incluyendo el nombre del empleado asignado.' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de la posición (32 caracteres)',
    example: '4028898594b7f9660194b7fb5d7a0600',
  })
  @ApiOkResponse({ description: 'Posición encontrada', type: PositionResponse })
  @ApiNotFoundResponse({ description: 'La posición con ID <id> no existe' })
  findOne(@Param('id') id: string) {
    return this.positionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar posición',
    description: 'Actualiza el nombre y código de una posición. No se permite si la posición tiene un empleado asignado.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de la posición (32 caracteres)',
    example: '4028898594b7f9660194b7fb5d7a0600',
  })
  @ApiOkResponse({ description: 'Posición actualizada', type: Position })
  @ApiBadRequestResponse({
    description: 'Datos inválidos (validación del body o propiedades no permitidas) o la posición <code> cuenta con un empleado asignado, no se puede actualizar',
  })
  @ApiNotFoundResponse({ description: 'La posición con ID <id> no existe' })
  update(@Param('id') id: string, @Body() updatePositionDto: UpdatePositionDto) {
    return this.positionService.update(id, updatePositionDto);
  }
}
