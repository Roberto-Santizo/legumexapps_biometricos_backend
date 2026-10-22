import { Auth } from '../auth/decorators/auth.decorator.js';
import { Controller, Get, Post, Patch, Param, Delete, UseInterceptors, BadRequestException, UploadedFiles, Req, Res, UploadedFile } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { imageFilter } from '../common/helpers/image-filter.js';
import { PhotosService } from './photos.service.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @UseInterceptors(FilesInterceptor('files', 100, {
    fileFilter: imageFilter
  }))
  create(@UploadedFiles() files: any[]) {
    if (files.length === 0) throw new BadRequestException("Make sure that the file exists and is an image");
    return this.photosService.create(files);
  }

  @Get(':key')
  servePhoto(@Param('key') key: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.photosService.servePhoto(key, req, res);
  }

  @Patch(':key')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: imageFilter
  }))
  update(@UploadedFile() file: any, @Param('key') key: string) {
    if (!file) throw new BadRequestException('Asegurese que la foto exista y sea una imágen');
    return this.photosService.update(key, file);
  }

  @Delete(':key')
  remove(@Param('key') key: string) {
    return this.photosService.remove(key);
  }
}
