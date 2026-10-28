import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePositionFincaDto } from './dto/create-position-finca.dto.js';
import { Filters } from '../common/providers/filters.js';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_FINCAS_CONNECTION } from '../common/constants/connections.js';
import { paginate } from '../common/helpers/paginate.js';
import { PositionFinca } from './entities/position-finca.entity.js';
import { PositionFincaQueryDto } from './dto/position-finca-query.dto.js';
import { Repository } from 'typeorm';
import { UpdatePositionFincaDto } from './dto/update-position-finca.dto.js';
import { EmployeesFinca } from '../employees-finca/entities/employees-finca.entity.js';
import { FincaPositionResource } from './resource/finca-position.resource.js';

@Injectable()
export class PositionFincaService {
  constructor(
    @InjectRepository(PositionFinca, MSSQL_FINCAS_CONNECTION)
    private readonly positionFincaRepository: Repository<PositionFinca>,

    @InjectRepository(EmployeesFinca, MSSQL_FINCAS_CONNECTION)
    private readonly employeesFincaRepository: Repository<EmployeesFinca>,

    private readonly filters: Filters
  ) { }

  async create(createPositionFincaDto: CreatePositionFincaDto) {
    const exists = await this.findOneByCode(createPositionFincaDto.position_code);
    if (exists) throw new BadRequestException(`El código ${createPositionFincaDto.position_code} ya existe`);

    const position = this.positionFincaRepository.create({ ...createPositionFincaDto, is_default: 0, company_id: 1, parent_position_id: 1 });
    await this.positionFincaRepository.save(position);

    return FincaPositionResource.fincaPositionResource(position);
  }

  async findAll(positionFincaQueryDto: PositionFincaQueryDto) {
    const { limit = 10, offset = 0 } = positionFincaQueryDto;
    const where = this.filters.buildWhere<PositionFinca, PositionFincaQueryDto>(positionFincaQueryDto, { like: ['position_code', 'position_name'] });

    const [positions, total] = await this.positionFincaRepository.findAndCount({
      take: limit,
      skip: offset,
      where
    });

    return paginate(FincaPositionResource.collection(positions), total, limit, offset);
  }

  async findOne(id: number) {
    const department = await this.positionFincaRepository.findOneBy({ id });
    if (!department) throw new NotFoundException(`La posición con ID ${id} no existe`);

    return department;
  }

  async findOneByCode(code: string) {
    const department = await this.positionFincaRepository.findOneBy({ position_code: code });
    return department;
  }

  async update(id: number, updatePositionFincaDto: UpdatePositionFincaDto) {
    const { position_code } = updatePositionFincaDto;

    if (position_code) {
      const exists = await this.findOneByCode(position_code);
      if (exists && exists.id != id) throw new BadRequestException(`El código ${position_code} ya existe`);
    }


    const positionFinca = await this.positionFincaRepository.preload({ id, ...updatePositionFincaDto });
    if (!positionFinca) throw new NotFoundException(`La posición con ID ${id} no existe`);

    await this.positionFincaRepository.save(positionFinca);

    return positionFinca;
  }

  async remove(id: number) {
    const hasEmployees = await this.employeesFincaRepository.exists({ where: { position: { id: id } } });
    if(hasEmployees) throw new BadRequestException(`La position con ID ${id} tiene empleados relacionados`);
    await this.positionFincaRepository.delete({ id });

    return 'Posición Eliminada Correctamente';
  }
}
