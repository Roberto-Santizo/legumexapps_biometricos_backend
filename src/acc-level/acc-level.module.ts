import { AccLevel } from './entities/acc-level.entity.js';
import { AccLevelController } from './acc-level.controller.js';
import { AccLevelService } from './acc-level.service.js';
import { Module } from '@nestjs/common';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { AccDoor } from './entities/acc_door.entity.js';
import { AccDevice } from './entities/acc_device.entity.js';
import { AccLevelDoor } from './entities/acc_level_door.entity.js';
import { AccLevelEmployee } from './entities/acc_level_employee.js';

@Module({
  controllers: [AccLevelController],
  providers: [AccLevelService],
  imports: [TypeOrmModule.forFeature([AccLevel, AccDoor, AccDevice, AccLevelDoor, AccLevelEmployee], MSSQL_CONNECTION), CommonModule, AuthModule],
  exports: [TypeOrmModule]
})
export class AccLevelModule { }
