import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Planification } from './entities/planification.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class PlanificationsService {
  constructor(
    @InjectRepository(Planification)
    private readonly planificationRepository: Repository<Planification>,
  ) { }
}
