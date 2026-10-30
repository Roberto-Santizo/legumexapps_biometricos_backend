import { AuthModule } from '../auth/auth.module.js';
import { CommonModule } from '../common/common.module.js';
import { Module } from '@nestjs/common';
import { Planification } from './entities/planification.entity.js';
import { PlanificationsController } from './planifications.controller.js';
import { PlanificationsService } from './planifications.service.js';
import { Task } from '../tasks/entities/task.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [PlanificationsController],
  providers: [PlanificationsService],
  imports: [
    TypeOrmModule.forFeature([Planification, Task]),
    AuthModule,
    CommonModule
  ],
})
export class PlanificationsModule { }
