import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../common/decorators/index.js';
import { EmployeeTransactionsService } from './employee-transactions.service.js';
import { EmployeeTransactionQueryDto } from './dto/employee-transaction-query.dto.js';
import { EmployeeTransactionResponse } from './resources/employee-transaction.response.js';
import { GenerateTransactionsReportDto } from './dto/generate-transactions-report.dto.js';

@ApiTags('Transacciones de empleados')
@Controller('employee-transactions')
export class EmployeeTransactionsController {
  constructor(private readonly employeeTransactionsService: EmployeeTransactionsService) { }

  @Get()
  @ApiOperation({
    summary: 'Listar transacciones de empleados',
    description: 'Devuelve las transacciones de empleados paginadas, con filtros opcionales por pin, nombre, apellidos, código y nombre de departamento (búsqueda parcial) y fecha del evento. La respuesta incluye `data`, `total`, `totalPages` y `currentPage`.',
  })
  @ApiPaginatedResponse(EmployeeTransactionResponse, 'Listado paginado de transacciones de empleados')
  @ApiBadRequestResponse({ description: 'Parámetros de consulta inválidos o no permitidos' })
  findAll(@Query() employeeTransactionQueryDto: EmployeeTransactionQueryDto) {
    return this.employeeTransactionsService.findAll(employeeTransactionQueryDto);
  }

  @Post('report')
  getTransactionReport(@Body() generateTransactionsDto: GenerateTransactionsReportDto) {
    return this.employeeTransactionsService.getTransactionsReport(generateTransactionsDto);
  }
}
