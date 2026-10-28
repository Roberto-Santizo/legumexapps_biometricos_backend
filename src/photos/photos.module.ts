import { Module } from '@nestjs/common';
import { PhotosService } from './photos.service.js';
import { PhotosController } from './photos.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { CommonModule } from '../common/common.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Photo } from './entities/photo.entity.js';

@Module({
  controllers: [PhotosController],
  providers: [PhotosService],
  imports:[
    TypeOrmModule.forFeature([Photo]),
    AuthModule,
    CommonModule
  ],
  exports:[ 
    PhotosService
  ]
})
export class PhotosModule {}
