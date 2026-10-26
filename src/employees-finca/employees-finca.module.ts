import { AuthModule } from '../auth/auth.module.js';
import { CommonModule } from '../common/common.module.js';
import { EmployeesFinca } from './entities/employees-finca.entity.js';
import { EmployeesFincaController } from './employees-finca.controller.js';
import { EmployeesFincaService } from './employees-finca.service.js';
import { Module } from '@nestjs/common';
import { MSSQL_FINCAS_CONNECTION } from '../common/constants/connections.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BiometricsModule } from '../biometrics/biometrics.module.js';
import { EmployeeResign } from './entities/employee-resign.entity.js';
import { AreaFincaEmployee } from '../area-finca/entities/area-finca-employee.js';

@Module({
  controllers: [EmployeesFincaController],
  providers: [EmployeesFincaService],
  imports: [
    TypeOrmModule.forFeature([EmployeesFinca, EmployeeResign, AreaFincaEmployee], MSSQL_FINCAS_CONNECTION),
    AuthModule,
    CommonModule,
    BiometricsModule
  ],
})
export class EmployeesFincaModule { }
