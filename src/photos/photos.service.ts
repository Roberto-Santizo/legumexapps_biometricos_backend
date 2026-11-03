import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreatePhotoDto } from './dto/create-photo.dto.js';
import { Filters } from '../common/providers/filters.js';
import { InjectDisk, serveFile, StorageDisk, StorageError } from '@nestjs/storage';
import { InjectRepository } from '@nestjs/typeorm';
import { Photo } from './entities/photo.entity.js';
import { PhotoQueryDto } from './dto/photo-query.dto.js';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity.js';
import { paginate } from '../common/helpers/paginate.js';

@Injectable()
export class PhotosService {

  private readonly logger = new Logger(PhotosService.name);

  constructor(
    @InjectRepository(Photo)
    private readonly photosRepository: Repository<Photo>,

    @InjectDisk('photos')
    private readonly photos: StorageDisk,

    private readonly filters: Filters
  ) { }

  async create(createPhotoDto: CreatePhotoDto, created_by: User, file: any) {
    const { code } = createPhotoDto;
    const url = `${code}.jpg`;

    await this.getPhotoByCode(code);
    await this.photos.put(url, file.buffer, { contentType: file.mimetype });
    const newPhoto = this.photosRepository.create({ code, url, created_by });

    await this.photosRepository.save(newPhoto);
  }

  // Guarda o sobrescribe <code>.jpg y crea el registro Photo si no existe
  async upsert(code: string, file: any, created_by: User) {
    const url = `${code}.jpg`;

    await this.photos.put(url, file.buffer, { contentType: file.mimetype });

    const photo = await this.photosRepository.findOneBy({ code });
    if (photo) return photo;

    const newPhoto = this.photosRepository.create({ code, url, created_by });
    return this.photosRepository.save(newPhoto);
  }

  async findAll(photoQueryDto: PhotoQueryDto) {
    const { limit = 10, offset = 0 } = photoQueryDto;
    const where = this.filters.buildWhere<Photo, PhotoQueryDto>(photoQueryDto, { like: ['code'] });

    const [photos, total] = await this.photosRepository.findAndCount({
      take: limit,
      skip: offset,
      where
    });

    return paginate(photos, total, limit, offset);
  }

  async findOne(id: string) {
    const photo = await this.photosRepository.findOneBy({ id });
    if (!photo) throw new NotFoundException(`La imágen con ID ${id} no existe`);
    return photo;
  }

  async update(id: string, file: any) {
    const photo = await this.findOne(id);
    const url = `${photo.code}.jpg`
    await this.photos.put(url, file.buffer, { contentType: file.mimetype });
    return `Foto actualizada correctamente`;
  }

  async remove(id: string) {
    const photo = await this.findOne(id);
    await this.photos.delete(`${photo.code}.jpg`);
    await this.photosRepository.delete({ id });
    return `Foto Eliminada correctamente`;
  }

  async getPhotoByCode(code: string) {
    const photo = await this.photosRepository.findOneBy({ code });

    if (photo) throw new BadRequestException(`El código ${code} ya cuenta con foto asignada`);
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

  servePhoto(key: string, req: Request, res: Response) {
    return serveFile(this.photos, key, { req, res, disposition: 'inline' });
  }

  async uploadFiles(files: any[], created_by: User) {
    const errors: string[] = [];
    this.validateFiles(files);

    for (let i = 0; i <= files.length - 1; i++) {
      const file = files[i];

      try {
        const fileName = file.originalname.split('.')[0].toUpperCase();
        await this.create({ code: fileName }, created_by, file);
      } catch (error) {
        this.logger.debug(error);
        errors.push(`Hubo un error al cargar la imagen ${file.originalname}, revisa el archivo y cargala de nuevo`);
      }
    }

    const message = errors.length > 0 ? 'Carga Realizada Parcialmente' : 'Fotos cargadas correctamente';

    return { message, errors };
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
