import { AccDoor } from './entities/acc_door.entity.js';
import { AccDoorResource } from './resources/acc_door.resource.js';
import { AccLevel } from './entities/acc-level.entity.js';
import { AccLevelQueryDto } from './dto/acc-level-query.dto.js';
import { CreateAccLevelDto } from './dto/create-acc-level.dto.js';
import { DateHandlerService } from '../common/services/date-handler.service.js';
import { Filters } from '../common/providers/filters.js';
import { IdGeneratorService } from '../common/services/id-generator.service.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { Repository } from 'typeorm';
import { UpdateAccLevelDto } from './dto/update-acc-level.dto.js';
import { User } from '../auth/entities/user.entity.js';

@Injectable()
export class AccLevelService {
  constructor(
    @InjectRepository(AccLevel, MSSQL_CONNECTION)
    private readonly accLevelRepository: Repository<AccLevel>,

    @InjectRepository(AccDoor, MSSQL_CONNECTION)
    private readonly accDoorRepository: Repository<AccDoor>,


    private readonly idGenerator: IdGeneratorService,
    private readonly dateHandler: DateHandlerService,
    private readonly filters: Filters
  ) { }

  async create(createAccLevelDto: CreateAccLevelDto, user: User) {
    const id = this.idGenerator.generate32CaracterId();
    const newLevel = this.accLevelRepository.create({
      id,
      ...createAccLevelDto,
      creater_code: user.email,
      creater_name: user.name,
      create_time: this.dateHandler.getCurrentDate(),
      update_time: this.dateHandler.getCurrentDate(),
      timeseg_id: '4028898594b7f9660194b7fb5d7a0430'
    });

    await this.accLevelRepository.save(newLevel);

    return newLevel;
  }

  async findAll(accLevelQueryDto: AccLevelQueryDto) {
    const { limit = 10, offset = 0 } = accLevelQueryDto;
    const where = this.filters.buildWhere<AccLevel, AccLevelQueryDto>(accLevelQueryDto, { like: ['name'] });

    const levels = await this.accLevelRepository.find({
      take: limit,
      skip: offset,
      where
    });
    return levels;
  }

  async findOne(id: string) {
    const level = await this.accLevelRepository.findOneBy({ id });
    if (!level) throw new NotFoundException(`El nivel con ID ${id} no existe`);
    return level;
  }

  async update(id: string, updateAccLevelDto: UpdateAccLevelDto, user: User) {
    const level = await this.accLevelRepository.preload({
      id,
      ...updateAccLevelDto,
      update_time: this.dateHandler.getCurrentDate(),
      updater_code: user.email,
      updater_name: user.name

    });

    if (!level) throw new NotFoundException(`El nivel con ID ${id} no existe`);

    await this.accLevelRepository.save(level);

    return level;
  }

  async getDoors() {
    const doors = await this.accDoorRepository.find();
    return AccDoorResource.collection(doors);
  }
}
