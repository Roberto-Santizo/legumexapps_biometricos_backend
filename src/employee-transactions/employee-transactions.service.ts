import { EmployeeTransaction } from './entities/employee-transaction.entity.js';
import { EmployeeTransactionQueryDto } from './dto/employee-transaction-query.dto.js';
import { Filters } from '../common/providers/filters.js';
import { GenerateTransactionsReportDto } from './dto/generate-transactions-report.dto.js';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { paginate } from '../common/helpers/paginate.js';
import { Repository } from 'typeorm';
import { ExcelService } from '../common/services/excel.service.js';

@Injectable()
export class EmployeeTransactionsService {
  constructor(
    @InjectRepository(EmployeeTransaction, MSSQL_CONNECTION)
    private readonly employeeTransactionRepository: Repository<EmployeeTransaction>,

    @Inject()
    private readonly excelService: ExcelService,

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

    const transactions = await this.employeeTransactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.event_time >= :start_date', {
        start_date,
      })
      .andWhere('transaction.event_time < :end_date', {
        end_date,
      })
      .getMany();

    return this.excelService.generateTransactionsExcel(transactions);
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
