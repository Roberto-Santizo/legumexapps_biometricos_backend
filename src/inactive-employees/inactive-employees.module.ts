import { Module } from '@nestjs/common';
import { InactiveEmployeesService } from './inactive-employees.service.js';
import { InactiveEmployeesController } from './inactive-employees.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InactiveEmployee } from './entities/inactive-employee.entity.js';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { AuthModule } from '../auth/auth.module.js';
import { CommonModule } from '../common/common.module.js';
import { AuthDepartmentModule } from '../auth-department/auth-department.module.js';
import { EmployeesModule } from '../employees/employees.module.js';

@Module({
  controllers: [InactiveEmployeesController],
  providers: [InactiveEmployeesService],
  imports: [
    TypeOrmModule.forFeature([InactiveEmployee], MSSQL_CONNECTION),
    AuthModule,
    CommonModule,
    AuthDepartmentModule,
    EmployeesModule
  ],
  exports:[
    TypeOrmModule,
  ]
})
export class InactiveEmployeesModule { }
