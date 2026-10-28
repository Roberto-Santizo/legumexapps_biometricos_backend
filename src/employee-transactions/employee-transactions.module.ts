import { EmployeeTransaction } from './entities/employee-transaction.entity.js';
import { EmployeeTransactionsController } from './employee-transactions.controller.js';
import { EmployeeTransactionsService } from './employee-transactions.service.js';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module.js';

@Module({
  controllers: [EmployeeTransactionsController],
  providers: [EmployeeTransactionsService],
  imports: [
    TypeOrmModule.forFeature([EmployeeTransaction], MSSQL_CONNECTION),
    AuthModule,
    CommonModule
  ]
})
export class EmployeeTransactionsModule { }
