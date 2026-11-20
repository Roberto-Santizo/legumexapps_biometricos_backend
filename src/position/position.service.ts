import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { chunk } from '../common/helpers/chunk.js';
import { CreatePositionDto } from './dto/create-position.dto.js';
import { Filters } from '../common/providers/filters.js';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { paginate } from '../common/helpers/paginate.js';
import { Position } from './entities/position.entity.js';
import { PositionFactory } from './services/position-factory.service.js';
import { PositionQueryDto } from './dto/position-query.dto.js';
import { PositionUploadResult } from './interfaces/index.js';
import { PositionUploadValidator } from './services/position-upload-validator.service.js';
import { readPositionRows } from './helpers/position-excel.reader.js';
import { Repository } from 'typeorm';
import { UpdatePositionDto } from './dto/update-position.dto.js';
import { User } from '../auth/entities/user.entity.js';
import { PositionResource } from './resources/position.resource.js';

const INSERT_BATCH_SIZE = 100;

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(Position, MSSQL_CONNECTION)
    private readonly positionRepository: Repository<Position>,

    private readonly positionFactory: PositionFactory,
    private readonly uploadValidator: PositionUploadValidator,
    private readonly filters: Filters,
  ) { }

  async create(createPositionDto: CreatePositionDto, user: User) {
    const exists = await this.findOneByCode(createPositionDto.code);
    if (exists) throw new BadRequestException(`La posición con código ${exists.code} ya existe`);

    const newPosition = this.positionFactory.build(createPositionDto, user);
    await this.positionRepository.save(newPosition);

    return newPosition;
  }

  async uploadPositions(file: any, user: User): Promise<PositionUploadResult> {
    const rows = await readPositionRows(file.buffer);
    await this.uploadValidator.validate(rows);

    const positions = rows.map(row => this.positionFactory.build(row, user));
    await this.insertInBatches(positions);

    return {
      message: `${positions.length} posiciones creadas correctamente`,
      data: PositionResource.collection(positions),
    };
  }

  private async insertInBatches(positions: Position[]) {
    await this.positionRepository.manager.transaction(async manager => {
      for (const batch of chunk(positions, INSERT_BATCH_SIZE)) {
        await manager.insert(Position, batch);
      }
    });
  }

  async findAll(positionQueryDto: PositionQueryDto) {
    const { limit = 10, offset = 0 } = positionQueryDto;
    const where = this.filters.buildWhere<Position, PositionQueryDto>(positionQueryDto, { like: ['code', 'name'] });

    const [positions, total] = await this.positionRepository.findAndCount({
      take: limit,
      skip: offset,
      where,
      order: { code: 'ASC' }
    });

    return paginate(PositionResource.collection(positions), total, limit, offset);
  }

  async findOne(id: string) {
    const position = await this.positionRepository.findOneBy({ id });
    if (!position) throw new NotFoundException(`La posición con ID ${id} no existe`);
    return PositionResource.positionResource(position);
  }

  async findOneRaw(id: string) {
    const position = await this.positionRepository.findOneBy({ id });
    if (!position) throw new NotFoundException(`La posición con ID ${id} no existe`);
    return position;
  }

  async findOneByCode(code: string) {
    const position = await this.positionRepository.findOneBy({ code });
    return position;
  }

  async update(id: string, updatePositionDto: UpdatePositionDto) {
    if(updatePositionDto.code){
      const exists = await this.findOneByCode(updatePositionDto.code);
      if(exists) throw new BadRequestException(`Ya existe una posición con el código ${updatePositionDto.code}`);
    }

    const position = await this.findOneRaw(id);
    if (position.employee != null) throw new BadRequestException(`La posición ${position.code} cuenta con un empleado asignado, no se puede actualizar`);
    position.code = updatePositionDto.code;
    position.name = updatePositionDto.name;

    await this.positionRepository.save(position);
    return position;
  }

  async validatePosition(positionId: string, employeeId?: string) {
    const position = await this.findOneRaw(positionId);
    this.validateAvailability(position, employeeId);
    return position;
  }

  async findOneRawByCode(code: string) {
    const position = await this.findOneByCode(code);
    if (!position) throw new NotFoundException(`La posición con código ${code} no existe`);
    return position;
  }

  private validateAvailability(position: Position, employeeId?: string) {
    if (position.employee && position.employee.id !== employeeId) throw new BadRequestException(`La posición ${position.code} ya cuenta con un empleado asignado`);
  }
}
