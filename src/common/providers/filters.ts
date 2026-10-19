import { BadRequestException, Injectable } from '@nestjs/common';
import { And, FindOperator, FindOptionsWhere, ILike, LessThan, MoreThanOrEqual } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto.js';

const PAGINATION_KEYS = new Set<string>(['limit', 'offset'] satisfies (keyof PaginationDto)[]);

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

// Campos del DTO que también existen en la entidad (sin limit/offset)
export type FilterKeys<TEntity, TDto> = Exclude<
  Extract<keyof TDto, keyof TEntity>,
  keyof PaginationDto
>;

export interface BuildWhereOptions<TEntity, TDto> {
  // Campos string que se filtran con ILIKE '%valor%' en vez de igualdad exacta
  like?: FilterKeys<TEntity, TDto>[];
  // Campos fecha (UTC). Acepta 'YYYY-MM-DD' (día completo), 'desde,hasta' (rango inclusivo) o ISO completo (exacto)
  date?: FilterKeys<TEntity, TDto>[];
}

@Injectable()
export class Filters {
  /**
   * Construye el `where` de TypeORM a partir de un DTO de query.
   * Ignora valores vacíos (undefined, null, '') y las claves de paginación.
   *
   * @example
   * const where = this.filters.buildWhere<User, UsersQueryDto>(dto, { like: ['name'], date: ['created_at'] });
   * this.userRepository.find({ where, take: limit, skip: offset });
   */
  buildWhere<TEntity extends object, TDto extends object>(
    dto: TDto,
    options: BuildWhereOptions<TEntity, TDto> = {},
  ): FindOptionsWhere<TEntity> {
    const like = new Set<string>((options.like ?? []) as string[]);
    const date = new Set<string>((options.date ?? []) as string[]);
    const where: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (value === undefined || value === null || value === '') continue;
      if (PAGINATION_KEYS.has(key)) continue;

      if (date.has(key)) {
        where[key] = this.buildDateFilter(key, value);
      } else {
        where[key] = like.has(key) && typeof value === 'string' ? ILike(`%${value}%`) : value;
      }
    }

    return where as FindOptionsWhere<TEntity>;
  }

  private buildDateFilter(key: string, value: unknown): Date | FindOperator<Date> {
    if (value instanceof Date) return value;

    const [from, to] = String(value).split(',').map((part) => part.trim());

    // Rango: '2026-05-01,2026-05-28' -> [inicio de 'from', fin de 'to']
    if (to !== undefined) {
      return And(MoreThanOrEqual(this.parseDate(key, from)), LessThan(this.endOf(key, to)));
    }

    // Día completo: '2026-05-28' -> [2026-05-28T00:00Z, 2026-05-29T00:00Z)
    if (DATE_ONLY.test(from)) {
      return And(MoreThanOrEqual(this.parseDate(key, from)), LessThan(this.endOf(key, from)));
    }

    // ISO completo: '2026-05-28T23:17:26.000Z' -> igualdad exacta
    return this.parseDate(key, from);
  }

  // Límite superior exclusivo: día siguiente si es solo fecha, o +1ms si es ISO completo
  private endOf(key: string, value: string): Date {
    const date = this.parseDate(key, value);
    return new Date(date.getTime() + (DATE_ONLY.test(value) ? DAY_MS : 1));
  }

  private parseDate(key: string, value: string): Date {
    const date = new Date(DATE_ONLY.test(value) ? `${value}T00:00:00.000Z` : value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Fecha inválida en '${key}': ${value}`);
    }
    return date;
  }
}
