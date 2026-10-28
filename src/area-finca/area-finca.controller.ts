import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AreaFincaService } from './area-finca.service.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';

@ApiTags('Áreas Fincas')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")',
})
@ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin o fincas ("Unauthorized")' })
@Controller('area-finca')
export class AreaFincaController {
  constructor(private readonly areaFincaService: AreaFincaService) { }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  @ApiOperation({ summary: 'Listar áreas de fincas' })
  findAll() {
    return this.areaFincaService.findAll();
  }
}
