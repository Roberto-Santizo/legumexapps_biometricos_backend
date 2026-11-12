import { Module } from '@nestjs/common';
import { DiscountsService } from './discounts.service.js';
import { DiscountsController } from './discounts.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discount } from './entities/discount.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { EmployeesModule } from '../employees/employees.module.js';
import { CommonModule } from '../common/common.module.js';

@Module({
  controllers: [DiscountsController],
  providers: [DiscountsService],
  imports: [
    TypeOrmModule.forFeature([Discount]),
    EmployeesModule,
    AuthModule,
    CommonModule
  ]
})
export class DiscountsModule {}
