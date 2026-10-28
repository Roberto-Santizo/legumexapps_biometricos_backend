import { Auth } from '../auth/decorators/auth.decorator.js';
import { Controller, Get, Post, Patch, Param, Delete, UseInterceptors, BadRequestException, UploadedFiles, Req, Res, UploadedFile, Query, Body, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { imageFilter } from '../common/helpers/image-filter.js';
import { PhotosService } from './photos.service.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';
import { PhotoQueryDto } from './dto/photo-query.dto.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { User } from '../auth/entities/user.entity.js';
import { CreatePhotoDto } from './dto/create-photo.dto.js';

@ApiTags('Fotos')
@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) { }

  @Post('/uploadFiles')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @UseInterceptors(FilesInterceptor('files', 100, {
    fileFilter: imageFilter
  }))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cargar fotos de empleados',
    description: 'Carga hasta 100 imágenes en el almacenamiento de fotos. Cada archivo se guarda como <NOMBRE_EN_MAYÚSCULAS>.jpg (nombre del archivo sin extensión, normalmente el PIN del empleado). Los archivos que no son imagen se descartan. Si algún archivo falla, la carga es parcial y el error se reporta en `errors`.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Imágenes a cargar (jpg, jpeg, png o gif), máximo 100',
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          maxItems: 100,
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Resultado de la carga. `errors` contiene los archivos que no se pudieron guardar',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          enum: ['Fotos cargadas correctamente', 'Carga Realizada Parcialmente'],
          example: 'Fotos cargadas correctamente',
        },
        errors: {
          type: 'array',
          items: { type: 'string' },
          example: [],
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'No se envió ningún archivo de imagen válido ("Make sure that the file exists and is an image") o hay archivos con el mismo nombre ("Dentro de los archivos existen archivos con el mismo nombre, elimine los duplicados y vuelva a intentarlo")',
  })
  @ApiUnauthorizedResponse({
    description: 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")',
  })
  @ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin o rrhh ("Unauthorized")' })
  uploadFiles(@UploadedFiles() files: any[], @GetUser() user: User) {
    if (files.length === 0) throw new BadRequestException("Asegurate de que vengan archivos y sean imagenes");
    return this.photosService.uploadFiles(files, user);
  }


  @Post()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @UseInterceptors(FileInterceptor('file', { fileFilter: imageFilter }))
  create(@UploadedFile() file: any, @Body() createPhotoDto: CreatePhotoDto, @GetUser() user: User) {
    if (!file) throw new BadRequestException(`Asegurate de que la imagen exista`);
    return this.photosService.create(createPhotoDto, user, file);
  }

  @Get()
  findAll(@Query() photosQueryDto: PhotoQueryDto) {
    return this.photosService.findAll(photosQueryDto);
  }

  @Get(':key')
  @ApiOperation({
    summary: 'Obtener foto',
    description: 'Devuelve la imagen almacenada con la clave indicada (inline). Soporta `Range` (206) e `If-None-Match` (304). Endpoint público.',
  })
  @ApiParam({
    name: 'key',
    type: String,
    description: 'Nombre del archivo en el almacenamiento, incluyendo extensión',
    example: '10045.jpg',
  })
  @ApiProduces('image/jpeg', 'image/png', 'image/gif')
  @ApiOkResponse({
    description: 'Contenido binario de la imagen',
    schema: { type: 'string', format: 'binary' },
  })
  @ApiNotFoundResponse({ description: 'No existe una foto con la clave indicada o la clave es inválida' })
  servePhoto(@Param('key') key: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.photosService.servePhoto(key, req, res);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: imageFilter
  }))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar foto',
    description: 'Reemplaza (o crea) la foto <id>.jpg en el almacenamiento con la imagen enviada.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Nombre de la foto sin extensión (normalmente el PIN del empleado)',
    example: '10045',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Nueva imagen (jpg, jpeg, png o gif)',
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Foto actualizada',
    schema: { type: 'string', example: 'Foto actualizada correctamente' },
  })
  @ApiBadRequestResponse({
    description: 'No se envió archivo o no es una imagen válida ("Asegurese que la foto exista y sea una imágen")',
  })
  @ApiUnauthorizedResponse({
    description: 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")',
  })
  @ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin o rrhh ("Unauthorized")' })
  @ApiInternalServerErrorResponse({ description: 'Error al guardar la foto ("Hubo un error al cargar la foto")' })
  update(@UploadedFile() file: any, @Param('id', ParseUUIDPipe) id: string) {
    if (!file) throw new BadRequestException('Asegurese que la foto exista y sea una imágen');
    return this.photosService.update(id, file);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar foto',
    description: 'Elimina la foto <id>.jpg del almacenamiento.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Nombre de la foto sin extensión (normalmente el PIN del empleado)',
    example: '10045',
  })
  @ApiOkResponse({
    description: 'Foto eliminada',
    schema: { type: 'string', example: 'Foto Eliminada correctamente' },
  })
  @ApiInternalServerErrorResponse({ description: 'Error al eliminar la foto ("Hubo un error al cargar la foto")' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.photosService.remove(id);
  }

  @Get('/getBuffer/:key')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  getBuffer(@Param('key') key: string) {
    return this.photosService.getBuffer(key);
  }
}
