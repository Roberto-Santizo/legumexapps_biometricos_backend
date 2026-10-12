import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto, LoginDto } from './dto/index.js';
import { GetUser, Auth } from './decorators/index.js';
import { User } from './entities/user.entity.js';
import { AuthUserResponse } from './resources/auth-user.response.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({
    summary: 'Registrar usuario',
    description: 'Crea un nuevo usuario y devuelve sus datos junto con un token JWT.',
  })
  @ApiCreatedResponse({ description: 'Usuario registrado correctamente', type: AuthUserResponse })
  @ApiBadRequestResponse({
    description: 'Datos inválidos (validación del body o propiedades no permitidas) o el correo ya está registrado',
  })
  @ApiInternalServerErrorResponse({ description: 'Error inesperado de base de datos ("Please check server logs")' })
  create(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Valida las credenciales de un usuario activo y devuelve sus datos junto con un token JWT.',
  })
  @ApiCreatedResponse({ description: 'Inicio de sesión exitoso', type: AuthUserResponse })
  @ApiBadRequestResponse({ description: 'Datos inválidos (validación del body o propiedades no permitidas)' })
  @ApiUnauthorizedResponse({
    description: 'El usuario no existe o no está activo, o la contraseña es incorrecta ("Credentials are not valid")',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('check-status')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verificar estado de autenticación',
    description: 'Devuelve los datos del usuario autenticado y un token JWT renovado.',
  })
  @ApiOkResponse({ description: 'Usuario autenticado', type: AuthUserResponse })
  @ApiUnauthorizedResponse({
    description: 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")',
  })
  checkStatus(@GetUser() user: User) {
    return this.authService.checkStatus(user);
  }
}
