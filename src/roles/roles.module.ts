import { Module } from '@nestjs/common';
import { RolesService } from './roles.service.js';
import { RolesController } from './roles.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity.js';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [TypeOrmModule.forFeature([Role])]
})
export class RolesModule { }
