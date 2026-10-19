import { DateHandlerService } from '../common/services/date-handler.service.js';
import { EmployeeTransaction } from './entities/employee-transaction.entity.js';
import { EmployeeTransactionQueryDto } from './dto/employee-transaction-query.dto.js';
import { EmployeeTransactionsResource } from './resources/employee-transactions.resource.js';
import { Filters } from '../common/providers/filters.js';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { Repository } from 'typeorm';

@Injectable()
export class EmployeeTransactionsService {
  constructor(
    @InjectRepository(EmployeeTransaction, MSSQL_CONNECTION)
    private readonly employeeTransactionRepository: Repository<EmployeeTransaction>,

    @Inject()
    private readonly dateHandler: DateHandlerService,

    private readonly filters: Filters
  ) { }

  async findAll(employeeTransactionQueryDto: EmployeeTransactionQueryDto) {
    const { limit = 10, offset = 0 } = employeeTransactionQueryDto;

    const where = this.filters.buildWhere<EmployeeTransaction, EmployeeTransactionQueryDto>(employeeTransactionQueryDto,
      { like: ['pin', 'name', 'last_name', 'dept_code', 'dept_name'], date: ['event_time'] });

    const transactions = await this.employeeTransactionRepository.find({
      take: limit,
      skip: offset,
      where
    });

    const resource = new EmployeeTransactionsResource(this.dateHandler);

    return resource.collection(transactions);
  }
}
