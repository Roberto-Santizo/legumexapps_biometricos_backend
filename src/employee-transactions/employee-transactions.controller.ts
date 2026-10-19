import { Controller, Get, Query } from '@nestjs/common';
import { EmployeeTransactionsService } from './employee-transactions.service.js';
import { EmployeeTransactionQueryDto } from './dto/employee-transaction-query.dto.js';

@Controller('employee-transactions')
export class EmployeeTransactionsController {
  constructor(private readonly employeeTransactionsService: EmployeeTransactionsService) {}

  @Get()
  findAll(@Query() employeeTransactionQueryDto: EmployeeTransactionQueryDto) {
    return this.employeeTransactionsService.findAll(employeeTransactionQueryDto);
  }
}
