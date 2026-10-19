import { Controller, Get, Param, Post, Query } from '@nestjs/common';
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
import { ApiPaginatedResponse } from '../common/decorators/index.js';
import { InactiveEmployeesService } from './inactive-employees.service.js';
import { InactiveEmployeeDetailResponse, InactiveEmployeeResponse } from './resources/inactive-employee.response.js';
import { InactiveEmployeesQueryDto } from './dto/inactive-employees-query.dto.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';

@ApiTags('Empleados inactivos')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")',
})
@ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin o rrhh ("Unauthorized")' })
@Controller('inactive-employees')
export class InactiveEmployeesController {
  constructor(private readonly inactiveEmployeesService: InactiveEmployeesService) { }

  @Get()
  @ApiOperation({
    summary: 'Listar empleados inactivos',
    description: 'Devuelve los empleados dados de baja en ZKBioAccess paginados, con filtro opcional por nombre (búsqueda parcial) y el nombre de su departamento. La respuesta incluye `data`, `total`, `totalPages` y `currentPage`.',
  })
  @ApiPaginatedResponse(InactiveEmployeeResponse, 'Listado paginado de empleados inactivos')
  @ApiBadRequestResponse({ description: 'Parámetros de consulta inválidos o no permitidos' })
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  findAll(@Query() inactiveEmployeesQueryDto: InactiveEmployeesQueryDto) {
    return this.inactiveEmployeesService.findAll(inactiveEmployeesQueryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener empleado inactivo',
    description: 'Devuelve el detalle de un empleado dado de baja por su ID, incluyendo quién creó y actualizó el registro.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del registro de baja del empleado',
    example: '4028898594b7f9660194b7fb5d7a0600',
  })
  @ApiOkResponse({ description: 'Empleado inactivo encontrado', type: InactiveEmployeeDetailResponse })
  @ApiNotFoundResponse({ description: 'El empleado con ID <id> no existe' })
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  findOne(@Param('id') id: string) {
    return this.inactiveEmployeesService.findOne(id);
  }

  @Post('/status/reActivateEmployee/:id')
  @ApiOperation({
    summary: 'Reactivar empleado',
    description: 'Busca el empleado inactivo por ID y lo da de alta nuevamente en ZKBioAccess (/person/reinstated).',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del registro de baja del empleado',
    example: '4028898594b7f9660194b7fb5d7a0600',
  })
  @ApiCreatedResponse({
    description: 'Empleado reactivado correctamente',
    schema: { type: 'string', example: 'Empleado dado de alta correctamente.' },
  })
  @ApiInternalServerErrorResponse({
    description: 'El empleado inactivo no existe o hubo un error al comunicarse con ZKBioAccess ("Please check server logs")',
  })
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  reActiveEmployeeById(@Param('id') id: string) {
    return this.inactiveEmployeesService.reActivateEmployeeById(id);
  }
}
