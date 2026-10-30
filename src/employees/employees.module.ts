import { AccLevelModule } from '../acc-level/acc-level.module.js';
import { AuthDepartmentModule } from '../auth-department/auth-department.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { CommonModule } from '../common/common.module.js';
import { Employee } from './entities/employee.entity.js';
import { EmployeesController } from './employees.controller.js';
import { EmployeesService } from './employees.service.js';
import { forwardRef, Module } from '@nestjs/common';
import { InactiveEmployeesModule } from '../inactive-employees/inactive-employees.module.js';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { PhotosService } from '../photos/photos.service.js';
import { PositionModule } from '../position/position.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZkBioaccessService } from './services/zkbioaccess.service.js';
import { PhotosModule } from '../photos/photos.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee], MSSQL_CONNECTION),
    AccLevelModule,
    AuthDepartmentModule,
    AuthModule,
    CommonModule,
    PositionModule,
    PhotosModule,
    forwardRef(() => InactiveEmployeesModule)
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService, ZkBioaccessService],
  exports: [TypeOrmModule, ZkBioaccessService, EmployeesService]
})
export class EmployeesModule { }
