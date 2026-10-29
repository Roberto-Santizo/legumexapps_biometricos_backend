import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PositionService } from './position.service.js';
import { CreatePositionDto } from './dto/create-position.dto.js';
import { UpdatePositionDto } from './dto/update-position.dto.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { User } from '../auth/entities/user.entity.js';
import { PositionQueryDto } from './dto/position-query.dto.js';

@Controller('position')
export class PositionController {
  constructor(private readonly positionService: PositionService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  create(@Body() createPositionDto: CreatePositionDto, @GetUser() user: User) {
    return this.positionService.create(createPositionDto, user);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  findAll(@Query() positionQueryDto: PositionQueryDto) {
    return this.positionService.findAll(positionQueryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.positionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePositionDto: UpdatePositionDto) {
    return this.positionService.update(id, updatePositionDto);
  }
}
