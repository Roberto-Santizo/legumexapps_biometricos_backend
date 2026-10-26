import { Module } from '@nestjs/common';
import { AreaFincaService } from './area-finca.service.js';
import { AreaFincaController } from './area-finca.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AreaFinca } from './entities/area-finca.entity.js';
import { MSSQL_FINCAS_CONNECTION } from '../common/constants/connections.js';
import { AreaFincaEmployee } from './entities/area-finca-employee.js';

@Module({
  controllers: [AreaFincaController],
  providers: [AreaFincaService],
  imports: [
    TypeOrmModule.forFeature([AreaFinca, AreaFincaEmployee], MSSQL_FINCAS_CONNECTION)
  ]
})
export class AreaFincaModule { }
