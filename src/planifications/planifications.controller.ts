import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { CreatePlanificationDto } from './dto/create-planification.dto.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { PlanificationQueryDto } from './dto/planification-query.dto.js';
import { PlanificationsService } from './planifications.service.js';
import { User } from '../auth/entities/user.entity.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';

@ApiTags('Planificaciones')
@Controller('planifications')
export class PlanificationsController {
  constructor(private readonly planificationsService: PlanificationsService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  create(@Body() createPlanificationDto: CreatePlanificationDto, @GetUser() user: User) {
    return this.planificationsService.create(createPlanificationDto, user);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  findAll(@Query() planificationQueryDto: PlanificationQueryDto) {
    return this.planificationsService.findAll(planificationQueryDto);
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.planificationsService.findOne(id);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.planificationsService.remove(id);
  }
}
