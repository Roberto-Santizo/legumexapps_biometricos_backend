import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { PositionFincaService } from './position-finca.service.js';
import { CreatePositionFincaDto } from './dto/create-position-finca.dto.js';
import { UpdatePositionFincaDto } from './dto/update-position-finca.dto.js';
import { PositionFincaQueryDto } from './dto/position-finca-query.dto.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';

@Controller('position-finca')
export class PositionFincaController {
  constructor(private readonly positionFincaService: PositionFincaService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  create(@Body() createPositionFincaDto: CreatePositionFincaDto) {
    return this.positionFincaService.create(createPositionFincaDto);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  findAll(@Query() positionFincaQueryDto: PositionFincaQueryDto) {
    return this.positionFincaService.findAll(positionFincaQueryDto);
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.positionFincaService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePositionFincaDto: UpdatePositionFincaDto) {
    return this.positionFincaService.update(id, updatePositionFincaDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.fincas)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.positionFincaService.remove(id);
  }
}
