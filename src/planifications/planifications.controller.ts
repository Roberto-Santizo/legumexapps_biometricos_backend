import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
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
import { Auth } from '../auth/decorators/auth.decorator.js';
import { CreatePlanificationDto } from './dto/create-planification.dto.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { PlanificationDetailResponse, PlanificationListResponse, PlanificationResponse } from './resources/planification.response.js';
import { PlanificationQueryDto } from './dto/planification-query.dto.js';
import { PlanificationsService } from './planifications.service.js';
import { User } from '../auth/entities/user.entity.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';

const UNAUTHORIZED_DESCRIPTION = 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")';
const FORBIDDEN_DESCRIPTION = 'El usuario autenticado no tiene el rol admin o rrhh ("Unauthorized")';

@ApiTags('Planificaciones')
@Controller('planifications')
export class PlanificationsController {
  constructor(private readonly planificationsService: PlanificationsService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear planificación semanal',
    description: 'Crea la planificación de una semana ISO (lunes a domingo). `start_date` y `end_date` se calculan en el servidor en zona America/Guatemala a partir de `year` y `week`.',
  })
  @ApiCreatedResponse({ description: 'Planificación creada', type: PlanificationResponse })
  @ApiBadRequestResponse({
    description: 'Datos inválidos (validación del body o propiedades no permitidas), el año no tiene esa semana ("El año <year> no tiene la semana <week>") o la planificación ya existe ("La planificación de la semana <week> del año <year> ya existe")',
  })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION })
  @ApiForbiddenResponse({ description: FORBIDDEN_DESCRIPTION })
  create(@Body() createPlanificationDto: CreatePlanificationDto, @GetUser() user: User) {
    return this.planificationsService.create(createPlanificationDto, user);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar planificaciones',
    description: 'Devuelve las planificaciones paginadas (más recientes primero), con filtro opcional por año. Cada semana incluye `counts` con el total de tareas y los conteos por tipo y por estado. La respuesta incluye `data`, `total`, `totalPages` y `currentPage`.',
  })
  @ApiPaginatedResponse(PlanificationListResponse, 'Listado paginado de planificaciones')
  @ApiBadRequestResponse({ description: 'Parámetros de consulta inválidos o no permitidos' })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION })
  @ApiForbiddenResponse({ description: FORBIDDEN_DESCRIPTION })
  findAll(@Query() planificationQueryDto: PlanificationQueryDto) {
    return this.planificationsService.findAll(planificationQueryDto);
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener planificación',
    description: 'Devuelve la planificación con sus tareas, ordenadas por fecha programada.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'ID de la planificación (UUID)',
    example: '3f2b8c1e-6d4a-4b9e-9c1a-2e7f5d8a9b10',
  })
  @ApiOkResponse({ description: 'Planificación encontrada', type: PlanificationDetailResponse })
  @ApiBadRequestResponse({ description: 'El ID no es un UUID válido' })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION })
  @ApiForbiddenResponse({ description: FORBIDDEN_DESCRIPTION })
  @ApiNotFoundResponse({ description: 'La planificación con ID <id> no existe' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.planificationsService.findOne(id);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar planificación',
    description: 'Elimina una planificación solo si no tiene tareas asociadas.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'ID de la planificación (UUID)',
    example: '3f2b8c1e-6d4a-4b9e-9c1a-2e7f5d8a9b10',
  })
  @ApiOkResponse({
    description: 'Planificación eliminada correctamente',
    schema: { type: 'string', example: 'Planificación 3f2b8c1e-6d4a-4b9e-9c1a-2e7f5d8a9b10 eliminada correctamente' },
  })
  @ApiBadRequestResponse({
    description: 'El ID no es un UUID válido o la planificación tiene tareas ("La planificación tiene <n> tarea(s) asociada(s) y no puede eliminarse")',
  })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION })
  @ApiForbiddenResponse({ description: FORBIDDEN_DESCRIPTION })
  @ApiNotFoundResponse({ description: 'La planificación con ID <id> no existe' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.planificationsService.remove(id);
  }
}
