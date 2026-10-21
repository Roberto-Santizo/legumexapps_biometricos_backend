import { Module } from '@nestjs/common';
import { Task } from './entities/task.entity.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { CommonModule } from '../common/common.module.js';
import { AuthDepartmentModule } from '../auth-department/auth-department.module.js';
import { AccLevelModule } from '../acc-level/acc-level.module.js';
import { EmployeesModule } from '../employees/employees.module.js';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  imports:[ 
    TypeOrmModule.forFeature([ Task ]),
    AuthModule,
    AuthDepartmentModule,
    AccLevelModule,
    EmployeesModule,
    CommonModule,
  ]
})
export class TasksModule {}
