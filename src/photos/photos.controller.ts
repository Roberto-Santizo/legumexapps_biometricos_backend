import { Auth } from '../auth/decorators/auth.decorator.js';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, BadRequestException, UploadedFile, UploadedFiles } from '@nestjs/common';
import { CreatePhotoDto } from './dto/create-photo.dto.js';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { imageFilter } from '../common/helpers/image-filter.js';
import { PhotosService } from './photos.service.js';
import { UpdatePhotoDto } from './dto/update-photo.dto.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @UseInterceptors(FilesInterceptor('files', 10, {
    fileFilter: imageFilter
  }))
  create(@UploadedFiles() files: any[]) {
    if (files.length === 0) throw new BadRequestException("Make sure that the file exists and is an image");
    return this.photosService.create(files);
  }

  @Get()
  findAll() {
    return this.photosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.photosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePhotoDto: UpdatePhotoDto) {
    return this.photosService.update(+id, updatePhotoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.photosService.remove(+id);
  }
}
