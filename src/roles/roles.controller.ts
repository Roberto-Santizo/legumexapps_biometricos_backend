import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { RolesService } from './roles.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import { Role } from './entities/role.entity.js';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  @ApiOperation({ summary: 'Crear rol', description: 'Registra un nuevo rol. El nombre se guarda en minúsculas.' })
  @ApiCreatedResponse({ description: 'Rol creado correctamente', type: Role })
  @ApiBadRequestResponse({ description: 'Datos inválidos, propiedades no permitidas o "El rol con nombre <name> ya se encuentra registrado"' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar roles', description: 'Devuelve los roles paginados (por defecto limit=10, offset=0).' })
  @ApiOkResponse({ description: 'Listado de roles', type: [Role] })
  @ApiBadRequestResponse({ description: 'Parámetros de paginación inválidos o no permitidos' })
  findAll(@Query() pagination: PaginationDto) {
    return this.rolesService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener rol por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del rol', example: 1 })
  @ApiOkResponse({ description: 'Rol encontrado', type: Role })
  @ApiBadRequestResponse({ description: 'El ID no es un número entero' })
  @ApiNotFoundResponse({ description: 'El rol con el ID <id> no existe' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar rol', description: 'Actualiza parcialmente un rol. El nombre se guarda en minúsculas.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del rol', example: 1 })
  @ApiOkResponse({ description: 'Rol actualizado correctamente', type: Role })
  @ApiBadRequestResponse({ description: 'ID no numérico, datos inválidos, propiedades no permitidas o "El rol con nombre <name> ya se encuentra registrado"' })
  @ApiNotFoundResponse({ description: 'El rol con ID <id> no existe' })
  @ApiInternalServerErrorResponse({ description: 'Error inesperado al guardar el rol' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }
}
