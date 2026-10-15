import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AccLevelService } from './acc-level.service.js';
import { CreateAccLevelDto } from './dto/create-acc-level.dto.js';
import { UpdateAccLevelDto } from './dto/update-acc-level.dto.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { User } from '../auth/entities/user.entity.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';
import { AccLevelQueryDto } from './dto/acc-level-query.dto.js';
import { AssignDoorToLevelDto } from './dto/assign-door-to-level.dto.js';

@Controller('acc-level')
export class AccLevelController {
  constructor(private readonly accLevelService: AccLevelService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  create(@Body() createAccLevelDto: CreateAccLevelDto, @GetUser() user: User) {
    return this.accLevelService.create(createAccLevelDto, user);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  findAll(@Query() accLevelQueryDto: AccLevelQueryDto) {
    return this.accLevelService.findAll(accLevelQueryDto);
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  findOne(@Param('id') id: string) {
    return this.accLevelService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  update(@Param('id') id: string, @Body() updateAccLevelDto: UpdateAccLevelDto, @GetUser() user: User) {
    return this.accLevelService.update(id, updateAccLevelDto, user);
  }

  @Get('/doors/getLevelDoors/:id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  getLevelDoors(@Param('id') id: string) {
    return this.accLevelService.getLevelDoors(id);
  }

  @Get('/doors/getDoors')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  getDoors() {
    return this.accLevelService.getDoors();
  }

  @Post('/doors/assignDoorToLevel')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  assignDoorToLevel(@Body() assignDoorToLevelDto: AssignDoorToLevelDto, @GetUser() user: User) {
    return this.accLevelService.assignDoorToLevel(assignDoorToLevelDto, user);
  }
}
