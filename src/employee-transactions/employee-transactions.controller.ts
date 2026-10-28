import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../common/decorators/index.js';
import { EmployeeTransactionsService } from './employee-transactions.service.js';
import { EmployeeTransactionQueryDto } from './dto/employee-transaction-query.dto.js';
import { EmployeeTransaction } from './entities/employee-transaction.entity.js';
import { GenerateTransactionsReportDto } from './dto/generate-transactions-report.dto.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';

@ApiTags('Transacciones de empleados')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")',
})
@ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin o rrhh ("Unauthorized")' })
@Controller('employee-transactions')
export class EmployeeTransactionsController {
  constructor(private readonly employeeTransactionsService: EmployeeTransactionsService) { }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Listar transacciones de empleados',
    description: 'Devuelve las transacciones de empleados paginadas, con filtros opcionales por pin, nombre, apellidos, código y nombre de departamento (búsqueda parcial) y fecha del evento. La respuesta incluye `data`, `total`, `totalPages` y `currentPage`.',
  })
  @ApiPaginatedResponse(EmployeeTransaction, 'Listado paginado de transacciones de empleados')
  @ApiBadRequestResponse({
    description: "Parámetros de consulta inválidos o no permitidos, o fecha inválida en event_time (\"Fecha inválida en 'event_time': <valor>\")",
  })
  @ApiInternalServerErrorResponse({ description: 'Error al consultar las transacciones en la base de datos' })
  findAll(@Query() employeeTransactionQueryDto: EmployeeTransactionQueryDto) {
    return this.employeeTransactionsService.findAll(employeeTransactionQueryDto);
  }

  @Post('report')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({
    summary: 'Generar reporte de transacciones',
    description: 'Genera un archivo Excel (hoja "Marcajes" con nombre, código, posición, departamento y marcaje) con las transacciones cuyo event_time está entre start_date y el final del día de end_date. El rango no puede superar una semana. El archivo se devuelve como un Buffer serializado en JSON.',
  })
  @ApiCreatedResponse({
    description: 'Archivo Excel (.xlsx) generado, serializado como Buffer',
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', example: 'Buffer' },
        data: { type: 'array', items: { type: 'integer' }, example: [80, 75, 3, 4] },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Body inválido (fechas ausentes, inválidas o propiedades no permitidas) o el rango de fechas es mayor a una semana ("El rango de fechas no puede ser mayor a una semana")',
  })
  @ApiInternalServerErrorResponse({ description: 'Error al consultar las transacciones o al generar el archivo Excel' })
  getTransactionReport(@Body() generateTransactionsDto: GenerateTransactionsReportDto) {
    return this.employeeTransactionsService.getTransactionsReport(generateTransactionsDto);
  }
}
