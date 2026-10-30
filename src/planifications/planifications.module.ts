import { AuthModule } from '../auth/auth.module.js';
import { CommonModule } from '../common/common.module.js';
import { Module } from '@nestjs/common';
import { Planification } from './entities/planification.entity.js';
import { PlanificationsController } from './planifications.controller.js';
import { PlanificationsService } from './planifications.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [PlanificationsController],
  providers: [PlanificationsService],
  imports: [
    TypeOrmModule.forFeature([Planification]),
    AuthModule,
    CommonModule
  ],
})
export class PlanificationsModule { }
