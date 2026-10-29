import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { DashboardQueryDto } from './dto/index.js';
import { DashboardService } from './dashboard.service.js';
import {
  DashboardEmployeesResponse,
  DashboardPositionsResponse,
  DashboardSummaryResponse,
  DashboardTasksResponse,
  DashboardTransactionsResponse,
} from './responses/index.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';

const INVALID_RANGE_DESCRIPTION =
  'Parámetros de consulta inválidos o no permitidos, start_date mayor a end_date ("start_date no puede ser mayor a end_date") o rango mayor a 366 días';

@ApiTags('Dashboard')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")',
})
@ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin o rrhh ("Unauthorized")' })
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('summary')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Resumen general (KPIs)',
    description: 'Totales de empleados, departamentos, posiciones (ocupadas/vacantes), marcajes de hoy (UTC), tareas pendientes/fallidas, bajas y fotos. start_date/end_date aplican solo al conteo de bajas (por defecto últimos 30 días).',
  })
  @ApiOkResponse({ description: 'KPIs del dashboard', type: DashboardSummaryResponse })
  @ApiBadRequestResponse({ description: INVALID_RANGE_DESCRIPTION })
  @ApiInternalServerErrorResponse({ description: 'Error al consultar el resumen del dashboard' })
  getSummary(@Query() dashboardQueryDto: DashboardQueryDto) {
    return this.dashboardService.getSummary(dashboardQueryDto);
  }

  @Get('employees')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Métricas de empleados',
    description: 'Total de empleados activos, con y sin posición asignada, y conteo por departamento.',
  })
  @ApiOkResponse({ description: 'Métricas de empleados', type: DashboardEmployeesResponse })
  @ApiInternalServerErrorResponse({ description: 'Error al consultar las métricas de empleados' })
  getEmployees() {
    return this.dashboardService.getEmployees();
  }

  @Get('positions')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Métricas de posiciones',
    description: 'Total de posiciones, ocupadas, vacantes y listado de hasta 50 posiciones vacantes.',
  })
  @ApiOkResponse({ description: 'Métricas de posiciones', type: DashboardPositionsResponse })
  @ApiInternalServerErrorResponse({ description: 'Error al consultar las métricas de posiciones' })
  getPositions() {
    return this.dashboardService.getPositions();
  }

  @Get('transactions')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Métricas de marcajes',
    description: 'Marcajes en el rango (por defecto últimos 30 días, UTC): total, empleados distintos, serie diaria, por dispositivo y por departamento.',
  })
  @ApiOkResponse({ description: 'Métricas de marcajes', type: DashboardTransactionsResponse })
  @ApiBadRequestResponse({ description: INVALID_RANGE_DESCRIPTION })
  @ApiInternalServerErrorResponse({ description: 'Error al consultar las métricas de marcajes' })
  getTransactions(@Query() dashboardQueryDto: DashboardQueryDto) {
    return this.dashboardService.getTransactions(dashboardQueryDto);
  }

  @Get('tasks')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Métricas de tareas',
    description: 'Conteo de tareas por estado y por tipo con scheduled_at en el rango (por defecto últimos 30 días), próximas 10 pendientes y últimas 10 fallidas.',
  })
  @ApiOkResponse({ description: 'Métricas de tareas', type: DashboardTasksResponse })
  @ApiBadRequestResponse({ description: INVALID_RANGE_DESCRIPTION })
  @ApiInternalServerErrorResponse({ description: 'Error al consultar las métricas de tareas' })
  getTasks(@Query() dashboardQueryDto: DashboardQueryDto) {
    return this.dashboardService.getTasks(dashboardQueryDto);
  }
}
