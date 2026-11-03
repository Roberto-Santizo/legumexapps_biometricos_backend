import { AuthModule } from '../auth/auth.module.js';
import { CommonModule } from '../common/common.module.js';
import { EmployeesModule } from '../employees/employees.module.js';
import { Module } from '@nestjs/common';
import { Permission } from './entities/permission.entity.js';
import { PermissionsController } from './permissions.controller.js';
import { PermissionsService } from './permissions.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService],
  imports: [
    TypeOrmModule.forFeature([Permission]),
    AuthModule,
    CommonModule,
    EmployeesModule
  ]
})
export class PermissionsModule { }
