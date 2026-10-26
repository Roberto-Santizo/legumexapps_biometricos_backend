import { Controller, Get } from '@nestjs/common';
import { AreaFincaService } from './area-finca.service.js';

@Controller('area-finca')
export class AreaFincaController {
  constructor(private readonly areaFincaService: AreaFincaService) { }

  @Get()
  findAll() {
    return this.areaFincaService.findAll();
  }
}
