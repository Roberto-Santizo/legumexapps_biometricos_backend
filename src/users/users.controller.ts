import { Controller, Get, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';
import { UsersQueryDto } from './dto/users-query.dto.js';
import { User } from '../auth/entities/user.entity.js';

@ApiTags('Users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")',
})
@ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin ("Unauthorized")' })
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @Auth(ValidRoles.admin)
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Devuelve los usuarios paginados, con filtros opcionales por nombre y correo (búsqueda parcial).',
  })
  @ApiOkResponse({ description: 'Listado de usuarios', type: [User] })
  @ApiBadRequestResponse({ description: 'Parámetros de consulta inválidos o no permitidos' })
  findAll(@Query() usersQueryDto: UsersQueryDto) {
    return this.usersService.findAll(usersQueryDto);
  }

  @Get(':id')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Obtener usuario', description: 'Devuelve los datos de un usuario por su ID.' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'ID del usuario',
    example: '3f2b8c1e-9a4d-4e7b-8c21-5d6f7a8b9c0d',
  })
  @ApiOkResponse({ description: 'Usuario encontrado', type: User })
  @ApiBadRequestResponse({ description: 'El ID no es un UUID válido' })
  @ApiNotFoundResponse({ description: 'El usuario con ID <id> no existe' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Actualiza parcialmente los datos de un usuario por su ID.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'ID del usuario',
    example: '3f2b8c1e-9a4d-4e7b-8c21-5d6f7a8b9c0d',
  })
  @ApiOkResponse({ description: 'Usuario actualizado', type: User })
  @ApiBadRequestResponse({
    description: 'ID no es un UUID válido, datos inválidos (validación del body o propiedades no permitidas) o el correo ya está registrado',
  })
  @ApiInternalServerErrorResponse({
    description: 'El usuario no existe o error inesperado de base de datos ("Please check server logs")',
  })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiOperation({
    summary: 'Activar/desactivar usuario',
    description: 'Alterna el estado activo del usuario (isActive). No elimina el registro.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'ID del usuario',
    example: '3f2b8c1e-9a4d-4e7b-8c21-5d6f7a8b9c0d',
  })
  @ApiOkResponse({ description: 'Estado del usuario actualizado', type: User })
  @ApiBadRequestResponse({ description: 'El ID no es un UUID válido' })
  @ApiNotFoundResponse({ description: 'El usuario con ID <id> no existe' })
  toggleIsActiveUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.toggleIsActiveUser(id);
  }
}
