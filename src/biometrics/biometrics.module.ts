import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module.js';
import { BiotimeService } from './services/biotime.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '../departments/entities/department.entity.js';
import { MSSQL_FINCAS_CONNECTION } from '../common/constants/connections.js';

@Module({
    providers: [BiotimeService],
    imports: [
        TypeOrmModule.forFeature([Department],  MSSQL_FINCAS_CONNECTION),
        CommonModule
    ],
    exports: [BiotimeService]
})
export class BiometricsModule { }
