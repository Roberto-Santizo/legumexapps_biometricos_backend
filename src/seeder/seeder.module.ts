import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service.js';
import { SeederController } from './seeder.controller.js';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  controllers: [SeederController],
  providers: [SeederService],
  imports: [
    ConfigModule,
    AuthModule
  ]
})
export class SeederModule {}
