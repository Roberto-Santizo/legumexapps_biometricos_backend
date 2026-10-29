import { AuthDepartment } from '../auth-department/entities/auth-department.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { CommonModule } from '../common/common.module.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';
import { Employee } from '../employees/entities/employee.entity.js';
import { EmployeeTransaction } from '../employee-transactions/entities/employee-transaction.entity.js';
import { InactiveEmployee } from '../inactive-employees/entities/inactive-employee.entity.js';
import { Module } from '@nestjs/common';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { Photo } from '../photos/entities/photo.entity.js';
import { Position } from '../position/entities/position.entity.js';
import { Task } from '../tasks/entities/task.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports: [
    TypeOrmModule.forFeature([Employee, InactiveEmployee, EmployeeTransaction, AuthDepartment, Position], MSSQL_CONNECTION),
    TypeOrmModule.forFeature([Task, Photo]),
    AuthModule,
    CommonModule,
  ],
})
export class DashboardModule { }
