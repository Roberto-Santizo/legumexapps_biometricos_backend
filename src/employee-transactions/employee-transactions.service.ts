import { BadRequestException, Injectable } from '@nestjs/common';
import { EmployeeTransaction } from './entities/employee-transaction.entity.js';
import { EmployeeTransactionQueryDto } from './dto/employee-transaction-query.dto.js';
import { Filters } from '../common/providers/filters.js';
import { GenerateTransactionsReportDto } from './dto/generate-transactions-report.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { paginate } from '../common/helpers/paginate.js';
import { Repository } from 'typeorm';
import { TransactionReportRow } from './interfaces/index.js';
import { TransactionsExport } from './reports/transaction.report.js';

@Injectable()
export class EmployeeTransactionsService {
  constructor(
    @InjectRepository(EmployeeTransaction, MSSQL_CONNECTION)
    private readonly employeeTransactionRepository: Repository<EmployeeTransaction>,

    private readonly filters: Filters
  ) { }

  async findAll(employeeTransactionQueryDto: EmployeeTransactionQueryDto) {
    const { limit = 10, offset = 0 } = employeeTransactionQueryDto;

    const where = this.filters.buildWhere<EmployeeTransaction, EmployeeTransactionQueryDto>(employeeTransactionQueryDto,
      { like: ['pin', 'name', 'last_name', 'dept_code', 'dept_name'], date: ['event_time'] });

    const [transactions, total] = await this.employeeTransactionRepository.findAndCount({
      take: limit,
      skip: offset,
      where
    });

    return paginate(transactions, total, limit, offset);
  }

  async getTransactionsReport(generateTransactionsDto: GenerateTransactionsReportDto) {
    const { start_date, end_date } = generateTransactionsDto;
    this.validateDates(start_date, end_date);

    end_date.setUTCDate(end_date.getUTCDate() + 1);

    const rows = await this.employeeTransactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.pin', 'pin')
      .addSelect('CAST(transaction.event_time AS date)', 'work_date')
      .addSelect('MAX(transaction.name)', 'name')
      .addSelect('MAX(transaction.last_name)', 'last_name')
      .addSelect('MAX(transaction.dept_name)', 'dept_name')
      .addSelect('MIN(transaction.event_time)', 'first_event_time')
      .addSelect('MAX(transaction.event_time)', 'last_event_time')
      .where('transaction.event_time >= :start_date', { start_date })
      .andWhere('transaction.event_time < :end_date', { end_date })
      .groupBy('transaction.pin')
      .addGroupBy('CAST(transaction.event_time AS date)')
      .orderBy('work_date', 'ASC')
      .addOrderBy('name', 'ASC')
      .getRawMany<TransactionReportRow>();

    const buffer = await new TransactionsExport(rows).toBuffer();
    return buffer;
  }

  private validateDates(startDate: Date, endDate: Date) {

    const differenceInMilliseconds =
      endDate.getTime() - startDate.getTime();

    const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;

    if (differenceInMilliseconds > oneWeekInMilliseconds) {
      throw new BadRequestException(
        'El rango de fechas no puede ser mayor a una semana',
      );
    }
  }
}
