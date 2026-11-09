import { Controller, Get } from '@nestjs/common';
import { SeederService } from './seeder.service.js';

@Controller('seeder')
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

  @Get()
  seeder(){
    return this.seederService.seedDb();
  }
}
