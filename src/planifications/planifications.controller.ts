import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PlanificationsService } from './planifications.service.js';

@ApiTags('Planificaciones')
@Controller('planifications')
export class PlanificationsController {
  constructor(private readonly planificationsService: PlanificationsService) { }
}
