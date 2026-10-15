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
import { AccLevelService } from './acc-level.service.js';
import { CreateAccLevelDto } from './dto/create-acc-level.dto.js';
import { UpdateAccLevelDto } from './dto/update-acc-level.dto.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { User } from '../auth/entities/user.entity.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';
import { AccLevelQueryDto } from './dto/acc-level-query.dto.js';
import { AssignDoorToLevelDto } from './dto/assign-door-to-level.dto.js';
import { AccLevel } from './entities/acc-level.entity.js';
import { AccLevelDoor } from './entities/acc_level_door.entity.js';
import { AccDoorResponse, AccLevelDoorResponse } from './resources/acc-level.response.js';

@ApiTags('Niveles de acceso')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")',
})
@ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin o rrhh ("Unauthorized")' })
@Controller('acc-level')
export class AccLevelController {
  constructor(private readonly accLevelService: AccLevelService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Crear nivel de acceso',
    description: 'Crea un nuevo nivel de acceso en ZKBioAccess registrando al usuario autenticado como creador.',
  })
  @ApiCreatedResponse({ description: 'Nivel de acceso creado', type: AccLevel })
  @ApiBadRequestResponse({ description: 'Datos inválidos (validación del body o propiedades no permitidas)' })
  @ApiInternalServerErrorResponse({ description: 'Error inesperado de base de datos' })
  create(@Body() createAccLevelDto: CreateAccLevelDto, @GetUser() user: User) {
    return this.accLevelService.create(createAccLevelDto, user);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Listar niveles de acceso',
    description: 'Devuelve los niveles de acceso paginados, con filtro opcional por nombre (búsqueda parcial).',
  })
  @ApiOkResponse({ description: 'Listado de niveles de acceso', type: [AccLevel] })
  @ApiBadRequestResponse({ description: 'Parámetros de consulta inválidos o no permitidos' })
  findAll(@Query() accLevelQueryDto: AccLevelQueryDto) {
    return this.accLevelService.findAll(accLevelQueryDto);
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({ summary: 'Obtener nivel de acceso', description: 'Devuelve los datos de un nivel de acceso por su ID.' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del nivel de acceso (32 caracteres)',
    example: '4028898594b7f9660194b7fb5d7a0430',
  })
  @ApiOkResponse({ description: 'Nivel de acceso encontrado', type: AccLevel })
  @ApiNotFoundResponse({ description: 'El nivel con ID <id> no existe' })
  findOne(@Param('id') id: string) {
    return this.accLevelService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Actualizar nivel de acceso',
    description: 'Actualiza parcialmente un nivel de acceso registrando al usuario autenticado como último editor.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del nivel de acceso (32 caracteres)',
    example: '4028898594b7f9660194b7fb5d7a0430',
  })
  @ApiOkResponse({ description: 'Nivel de acceso actualizado', type: AccLevel })
  @ApiBadRequestResponse({ description: 'Datos inválidos (validación del body o propiedades no permitidas)' })
  @ApiNotFoundResponse({ description: 'El nivel con ID <id> no existe' })
  @ApiInternalServerErrorResponse({ description: 'Error inesperado de base de datos' })
  update(@Param('id') id: string, @Body() updateAccLevelDto: UpdateAccLevelDto, @GetUser() user: User) {
    return this.accLevelService.update(id, updateAccLevelDto, user);
  }

  @Get('/doors/getLevelDoors/:id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Listar puertas de un nivel',
    description: 'Devuelve las puertas asignadas a un nivel de acceso. Si el nivel no existe o no tiene puertas, devuelve un arreglo vacío.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del nivel de acceso (32 caracteres)',
    example: '4028898594b7f9660194b7fb5d7a0430',
  })
  @ApiOkResponse({ description: 'Puertas asignadas al nivel', type: [AccLevelDoorResponse] })
  getLevelDoors(@Param('id') id: string) {
    return this.accLevelService.getLevelDoors(id);
  }

  @Get('/doors/getDoors')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({ summary: 'Listar puertas', description: 'Devuelve todas las puertas registradas con su dispositivo.' })
  @ApiOkResponse({ description: 'Listado de puertas', type: [AccDoorResponse] })
  getDoors() {
    return this.accLevelService.getDoors();
  }

  @Post('/doors/assignDoorToLevel')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Asignar puerta a nivel',
    description: 'Asigna una puerta a un nivel de acceso registrando al usuario autenticado como creador.',
  })
  @ApiCreatedResponse({ description: 'Puerta asignada al nivel', type: AccLevelDoor })
  @ApiBadRequestResponse({
    description: 'Datos inválidos (validación del body o propiedades no permitidas)',
  })
  @ApiInternalServerErrorResponse({ description: 'Error inesperado de base de datos ("Please check server logs")' })
  assignDoorToLevel(@Body() assignDoorToLevelDto: AssignDoorToLevelDto, @GetUser() user: User) {
    return this.accLevelService.assignDoorToLevel(assignDoorToLevelDto, user);
  }

  @Delete('/doors/deleteAccLevelDoor/:id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Quitar puerta de nivel',
    description: 'Elimina la asignación de una puerta a un nivel de acceso.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de la asignación puerta-nivel (32 caracteres)',
    example: '4028898594b7f9660194b7fb5d7a0431',
  })
  @ApiOkResponse({
    description: 'Asignación eliminada',
    schema: { type: 'string', example: 'Puerta eliminada de nivel correctamente' },
  })
  @ApiNotFoundResponse({ description: 'El permiso con ID <id> no existe' })
  deleteAccLevelDoor(@Param('id') id: string) {
    return this.accLevelService.deleteAccLevelDoor(id);
  }
}
