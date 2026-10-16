import { Module } from '@nestjs/common';
import { Task } from './entities/task.entity.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { CommonModule } from '../common/common.module.js';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  imports:[ 
    TypeOrmModule.forFeature([ Task ]),
    AuthModule,
    CommonModule,
  ]
})
export class TasksModule {}
