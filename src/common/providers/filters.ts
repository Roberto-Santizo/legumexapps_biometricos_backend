import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, ILike } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto.js';

const PAGINATION_KEYS = new Set<string>(['limit', 'offset'] satisfies (keyof PaginationDto)[]);

// Campos del DTO que también existen en la entidad (sin limit/offset)
export type FilterKeys<TEntity, TDto> = Exclude<
  Extract<keyof TDto, keyof TEntity>,
  keyof PaginationDto
>;

export interface BuildWhereOptions<TEntity, TDto> {
  // Campos string que se filtran con ILIKE '%valor%' en vez de igualdad exacta
  like?: FilterKeys<TEntity, TDto>[];
}

@Injectable()
export class Filters {
  /**
   * Construye el `where` de TypeORM a partir de un DTO de query.
   * Ignora valores vacíos (undefined, null, '') y las claves de paginación.
   *
   * @example
   * const where = this.filters.buildWhere<User, UsersQueryDto>(dto, { like: ['name'] });
   * this.userRepository.find({ where, take: limit, skip: offset });
   */
  buildWhere<TEntity extends object, TDto extends object>(
    dto: TDto,
    options: BuildWhereOptions<TEntity, TDto> = {},
  ): FindOptionsWhere<TEntity> {
    const like = new Set<string>((options.like ?? []) as string[]);
    const where: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (value === undefined || value === null || value === '') continue;
      if (PAGINATION_KEYS.has(key)) continue;

      where[key] = like.has(key) && typeof value === 'string' ? ILike(`%${value}%`) : value;
    }

    return where as FindOptionsWhere<TEntity>;
  }
}
