import { BadRequestException, Injectable } from '@nestjs/common';
import { chunk } from '../../common/helpers/chunk.js';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_CONNECTION } from '../../common/constants/connections.js';
import { Position } from '../entities/position.entity.js';
import { PositionRow } from '../interfaces/index.js';

const CODES_PER_QUERY = 1000;

@Injectable()
export class PositionUploadValidator {
  constructor(
    @InjectRepository(Position, MSSQL_CONNECTION)
    private readonly positionRepository: Repository<Position>,
  ) { }

  async validate(rows: PositionRow[]) {
    const errors = [
      ...this.findDuplicatedInFile(rows),
      ...await this.findAlreadyRegistered(rows),
    ];

    if (errors.length > 0) throw new BadRequestException(errors);
  }

  private findDuplicatedInFile(rows: PositionRow[]) {
    const firstRowByCode = new Map<string, number>();

    return rows.flatMap(({ code, rowNumber }) => {
      const firstRow = firstRowByCode.get(code);
      if (firstRow) return [`Fila ${rowNumber}: el código ${code} está repetido en el archivo (fila ${firstRow})`];
      firstRowByCode.set(code, rowNumber);
      return [];
    });
  }

  private async findAlreadyRegistered(rows: PositionRow[]) {
    const registeredCodes = await this.findRegisteredCodes(rows.map(row => row.code));

    return rows
      .filter(row => registeredCodes.has(row.code))
      .map(row => `Fila ${row.rowNumber}: la posición con código ${row.code} ya existe`);
  }

  private async findRegisteredCodes(codes: string[]) {
    const registeredCodes = new Set<string>();

    for (const codesBatch of chunk([...new Set(codes)], CODES_PER_QUERY)) {
      const positions = await this.positionRepository.find({
        select: { code: true },
        where: { code: In(codesBatch) },
        loadEagerRelations: false,
      });
      positions.forEach(position => registeredCodes.add(position.code));
    }

    return registeredCodes;
  }
}
