import { Department } from './entities/department.entity.js';
import { DepartmentsController } from './departments.controller.js';
import { DepartmentsService } from './departments.service.js';
import { Module } from '@nestjs/common';
import { MSSQL_FINCAS_CONNECTION } from '../common/constants/connections.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { BiometricsModule } from '../biometrics/biometrics.module.js';

@Module({
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
  imports: [
    TypeOrmModule.forFeature([Department], MSSQL_FINCAS_CONNECTION),

    AuthModule,
    CommonModule,
    BiometricsModule,
  ],

  exports: [TypeOrmModule]
})
export class DepartmentsModule { }
