import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectDisk, serveFile, StorageDisk, StorageError } from '@nestjs/storage';
import { imageBufferToBase64 } from '../common/helpers/base-64-enconder.js';

@Injectable()
export class PhotosService {
  private readonly logger = new Logger(PhotosService.name);
  constructor(
    @InjectDisk('photos')
    private readonly photos: StorageDisk,
  ) { }

  async create(files: any[]) {
    const errors: string[] = [];
    this.validateFiles(files);

    for (let i = 0; i <= files.length - 1; i++) {
      const file = files[i];

      try {
        const fileName = file.originalname.split('.')[0].toUpperCase();
        await this.photos.put(`${fileName}.jpg`, file.buffer, { contentType: file.mimetype });
      } catch (error) {
        this.logger.debug(error);
        errors.push(`Hubo un error al cargar la imagen ${file.originalname}, revisa el archivo y cargala de nuevo`);
      }
    }

    const message = errors.length > 0 ? 'Carga Realizada Parcialmente' : 'Fotos cargadas correctamente';

    return { message, errors };
  }


  servePhoto(key: string, req: Request, res: Response) {
    return serveFile(this.photos, key, { req, res, disposition: 'inline' });
  }

  async update(key: string, file: any) {
    try {
      await this.photos.put(`${key}.jpg`, file.buffer, { contentType: file.mimetype });
      return `Foto actualizada correctamente`;
    } catch (error) {
      this.logger.debug(error);
      throw new InternalServerErrorException('Hubo un error al cargar la foto');
    }
  }

  async remove(key: string) {
    try {
      await this.photos.delete(`${key}.jpg`);

      return `Foto Eliminada correctamente`;
    } catch (error) {
      this.logger.debug(error);
      throw new InternalServerErrorException('Hubo un error al cargar la foto');
    }
  }

  async getBuffer(key: string) {
    try {
      const image = await this.photos.getBuffer(`${key}.jpg`);
      return image;
    } catch (error) {
      if (error instanceof StorageError) {
        throw new BadRequestException(error.message);
      }

      throw new InternalServerErrorException("Hubo un error al leer la foto");
    }
  }

  private validateFiles(files: any[]) {
    const fileNames: string[] = [];
    files.map((file) => {
      const name: string = file.originalname.split('.')[0];
      fileNames.push(name.toUpperCase());
    });

    const hasDuplicates = new Set(fileNames).size !== fileNames.length;
    if (hasDuplicates) throw new BadRequestException(`Dentro de los archivos existen archivos con el mismo nombre, elimine los duplicados y vuelva a intentarlo`);
  }
}
