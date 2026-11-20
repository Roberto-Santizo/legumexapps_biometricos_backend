import { CreatePositionDto } from '../dto/create-position.dto.js';
import { DateHandlerService } from '../../common/services/date-handler.service.js';
import { IdGeneratorService } from '../../common/services/id-generator.service.js';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_CONNECTION } from '../../common/constants/connections.js';
import { Position } from '../entities/position.entity.js';
import { Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity.js';

const DEFAULT_COMPANY_ID = 1;

@Injectable()
export class PositionFactory {
  constructor(
    @InjectRepository(Position, MSSQL_CONNECTION)
    private readonly positionRepository: Repository<Position>,

    private readonly date: DateHandlerService,
    private readonly idGenerator: IdGeneratorService,
  ) { }

  build(data: CreatePositionDto, user: User): Position {
    const now = this.date.getCurrentDate();

    return this.positionRepository.create({
      id: this.idGenerator.generate32CaracterId(),
      code: data.code,
      name: data.name,
      create_time: now,
      update_time: now,
      creater_code: user.email,
      creater_name: user.name,
      company_id: DEFAULT_COMPANY_ID,
    });
  }
}
