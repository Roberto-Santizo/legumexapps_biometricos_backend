import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AreaFinca } from './entities/area-finca.entity.js';
import { MSSQL_FINCAS_CONNECTION } from '../common/constants/connections.js';
import { Repository } from 'typeorm';

@Injectable()
export class AreaFincaService {

  constructor(
    @InjectRepository(AreaFinca, MSSQL_FINCAS_CONNECTION)
    private readonly areaFincaRepository: Repository<AreaFinca>
  ){}

  async findAll() {
    const areas = this.areaFincaRepository.find();
    return areas;
  }
}
