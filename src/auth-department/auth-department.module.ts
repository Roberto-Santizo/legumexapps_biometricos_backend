import { AuthDepartment } from './entities/auth-department.entity.js';
import { AuthDepartmentController } from './auth-department.controller.js';
import { AuthDepartmentService } from './auth-department.service.js';
import { Module } from '@nestjs/common';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { CommonModule } from '../common/common.module.js';

@Module({
  controllers: [AuthDepartmentController],
  providers: [AuthDepartmentService],
  imports: [
    TypeOrmModule.forFeature([AuthDepartment], MSSQL_CONNECTION),
    AuthModule,
    CommonModule
  ]
})
export class AuthDepartmentModule {}
