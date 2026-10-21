import { AuthDepartmentModule } from '../auth-department/auth-department.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { CommonModule } from '../common/common.module.js';
import { Employee } from './entities/employee.entity.js';
import { EmployeesController } from './employees.controller.js';
import { EmployeesService } from './employees.service.js';
import { Module } from '@nestjs/common';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccLevelModule } from '../acc-level/acc-level.module.js';
import { ZkBioaccessService } from './services/zkbioaccess.service.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee], MSSQL_CONNECTION),
    AccLevelModule,
    AuthDepartmentModule,
    AuthModule,
    CommonModule,
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService, ZkBioaccessService],
  exports: [TypeOrmModule, ZkBioaccessService, EmployeesService]
})
export class EmployeesModule { }
