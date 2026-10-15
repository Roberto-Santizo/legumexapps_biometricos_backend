import { Controller, Get, Param, Post } from '@nestjs/common';
import { InactiveEmployeesService } from './inactive-employees.service.js';

@Controller('inactive-employees')
export class InactiveEmployeesController {
  constructor(private readonly inactiveEmployeesService: InactiveEmployeesService) { }

  @Get()
  findAll() {
    return this.inactiveEmployeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inactiveEmployeesService.findOne(id);
  }

  @Post('/status/reActivateEmployee/:id')
  reActiveEmployeeById(@Param('id') id: string) {
    return this.inactiveEmployeesService.reActivateEmployeeById(id);
  }
}
