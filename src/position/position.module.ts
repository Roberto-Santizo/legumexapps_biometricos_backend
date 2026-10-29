import { AuthModule } from '../auth/auth.module.js';
import { CommonModule } from '../common/common.module.js';
import { Module } from '@nestjs/common';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { Position } from './entities/position.entity.js';
import { PositionController } from './position.controller.js';
import { PositionService } from './position.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [PositionController],
  providers: [PositionService],
  imports: [
    TypeOrmModule.forFeature([Position], MSSQL_CONNECTION),
    AuthModule,
    CommonModule
  ],
  exports: [PositionService]
})
export class PositionModule { }
