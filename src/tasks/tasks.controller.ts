import { Auth } from '../auth/decorators/auth.decorator.js';
import { Controller, Get, Post, Param, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { TasksService } from './tasks.service.js';
import { User } from '../auth/entities/user.entity.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';
import { xlxsFileFilter } from '../common/helpers/xlxs-file-filter.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Post('upload/:type')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @UseInterceptors(FileInterceptor('file', { fileFilter: xlxsFileFilter }))
  create(@Param('type') type: string, @UploadedFile() file: any, @GetUser() user: User) {
    if (!file) throw new BadRequestException("Make sure that the file exists and its an xlxs");
    return this.tasksService.uploadFile(file, user, type);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }
}
