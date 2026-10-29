import { AccLevelModule } from '../acc-level/acc-level.module.js';
import { AuthDepartmentModule } from '../auth-department/auth-department.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { CommonModule } from '../common/common.module.js';
import { CronService } from './services/cron.service.js';
import { EmployeesModule } from '../employees/employees.module.js';
import { Module } from '@nestjs/common';
import { Task } from './entities/task.entity.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotosModule } from '../photos/photos.module.js';
import { InactiveEmployeesModule } from '../inactive-employees/inactive-employees.module.js';
import { PositionModule } from '../position/position.module.js';

@Module({
  controllers: [TasksController],
  providers: [TasksService, CronService],
  imports:[ 
    TypeOrmModule.forFeature([ Task ]),
    AuthModule,
    AuthDepartmentModule,
    AccLevelModule,
    EmployeesModule,
    CommonModule,
    EmployeesModule,
    InactiveEmployeesModule,
    PhotosModule,
    PositionModule
  ]
})
export class TasksModule {}
