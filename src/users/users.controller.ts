import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'Crear usuario', description: 'Registra un nuevo usuario. La contraseña no se incluye en la respuesta.' })
  @ApiCreatedResponse({ description: 'Usuario creado correctamente', type: User })
  @ApiBadRequestResponse({ description: 'Datos inválidos, propiedades no permitidas o "El email <email> ya se encuentra registrado"' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios', description: 'Devuelve los usuarios paginados (por defecto limit=10, offset=0).' })
  @ApiOkResponse({ description: 'Listado de usuarios', type: [User] })
  @ApiBadRequestResponse({ description: 'Parámetros de paginación inválidos o no permitidos' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID', description: 'Devuelve un arreglo con el usuario que coincide con el ID (vacío si no existe).' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario', example: 1 })
  @ApiOkResponse({ description: 'Usuario encontrado', type: [User] })
  @ApiBadRequestResponse({ description: 'El ID no es un número entero' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario', description: 'Actualiza parcialmente un usuario. La contraseña no se incluye en la respuesta.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario', example: 1 })
  @ApiOkResponse({ description: 'Usuario actualizado correctamente', type: User })
  @ApiBadRequestResponse({ description: 'ID no numérico, datos inválidos, propiedades no permitidas o "El email <email> ya se encuentra registrado"' })
  @ApiNotFoundResponse({ description: 'El usuario con ID <id> no existe' })
  @ApiInternalServerErrorResponse({ description: 'Error inesperado al guardar el usuario' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
}
