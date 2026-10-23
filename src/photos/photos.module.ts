import { Module } from '@nestjs/common';
import { PhotosService } from './photos.service.js';
import { PhotosController } from './photos.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { CommonModule } from '../common/common.module.js';

@Module({
  controllers: [PhotosController],
  providers: [PhotosService],
  imports:[
    AuthModule,
    CommonModule
  ],
  exports:[ 
    PhotosService
  ]
})
export class PhotosModule {}
