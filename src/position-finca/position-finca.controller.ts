import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../common/decorators/index.js';
import { PositionFincaService } from './position-finca.service.js';
import { CreatePositionFincaDto } from './dto/create-position-finca.dto.js';
import { UpdatePositionFincaDto } from './dto/update-position-finca.dto.js';
import { PositionFincaQueryDto } from './dto/position-finca-query.dto.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';
import { PositionFinca } from './entities/position-finca.entity.js';

@ApiTags('Posiciones Fincas')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")',
})
@ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin o fincas ("Unauthorized")' })
@Controller('position-finca')
export class PositionFincaController {
  constructor(private readonly positionFincaService: PositionFincaService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  @ApiOperation({
    summary: 'Crear posición',
    description: 'Crea una nueva posición en fincas. Se asigna automáticamente `is_default = 0`, `company_id = 1` y `parent_position_id = 1`.',
  })
  @ApiCreatedResponse({ description: 'Posición creada', type: PositionFinca })
  @ApiBadRequestResponse({
    description: 'Datos inválidos (validación del body o propiedades no permitidas) o el código ya existe ("El código <position_code> ya existe")',
  })
  create(@Body() createPositionFincaDto: CreatePositionFincaDto) {
    return this.positionFincaService.create(createPositionFincaDto);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  @ApiOperation({
    summary: 'Listar posiciones',
    description: 'Devuelve las posiciones paginadas, con filtros opcionales por código y nombre (búsqueda parcial). La respuesta incluye `data`, `total`, `totalPages` y `currentPage`.',
  })
  @ApiPaginatedResponse(PositionFinca, 'Listado paginado de posiciones')
  @ApiBadRequestResponse({ description: 'Parámetros de consulta inválidos o no permitidos' })
  findAll(@Query() positionFincaQueryDto: PositionFincaQueryDto) {
    return this.positionFincaService.findAll(positionFincaQueryDto);
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  @ApiOperation({ summary: 'Obtener posición', description: 'Devuelve los datos de una posición por su ID.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la posición', example: 1 })
  @ApiOkResponse({ description: 'Posición encontrada', type: PositionFinca })
  @ApiBadRequestResponse({ description: 'El ID no es un número entero válido' })
  @ApiNotFoundResponse({ description: 'La posición con ID <id> no existe' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.positionFincaService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  @ApiOperation({ summary: 'Actualizar posición', description: 'Actualiza parcialmente el código y/o nombre de una posición.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la posición', example: 1 })
  @ApiOkResponse({ description: 'Posición actualizada', type: PositionFinca })
  @ApiBadRequestResponse({
    description: 'ID inválido, datos inválidos (validación del body o propiedades no permitidas) o el código ya pertenece a otra posición ("El código <position_code> ya existe")',
  })
  @ApiNotFoundResponse({ description: 'La posición con ID <id> no existe' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePositionFincaDto: UpdatePositionFincaDto) {
    return this.positionFincaService.update(id, updatePositionFincaDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  @ApiOperation({
    summary: 'Eliminar posición',
    description: 'Elimina una posición siempre que no tenga empleados relacionados.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la posición', example: 1 })
  @ApiOkResponse({
    description: 'Posición eliminada',
    schema: { type: 'string', example: 'Posición Eliminada Correctamente' },
  })
  @ApiBadRequestResponse({
    description: 'ID inválido o la posición tiene empleados relacionados ("La position con ID <id> tiene empleados relacionados")',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.positionFincaService.remove(id);
  }
}
