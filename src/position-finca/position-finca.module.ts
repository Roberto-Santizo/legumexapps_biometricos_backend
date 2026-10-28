import { Module } from '@nestjs/common';
import { MSSQL_FINCAS_CONNECTION } from '../common/constants/connections.js';
import { PositionFinca } from './entities/position-finca.entity.js';
import { PositionFincaController } from './position-finca.controller.js';
import { PositionFincaService } from './position-finca.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { CommonModule } from '../common/common.module.js';
import { EmployeesFinca } from '../employees-finca/entities/employees-finca.entity.js';

@Module({
  controllers: [PositionFincaController],
  providers: [PositionFincaService],
  imports: [
    TypeOrmModule.forFeature([PositionFinca, EmployeesFinca], MSSQL_FINCAS_CONNECTION),
    AuthModule,
    CommonModule,
  ]
})
export class PositionFincaModule { }
