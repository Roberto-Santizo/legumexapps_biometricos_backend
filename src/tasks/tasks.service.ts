import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../auth/entities/user.entity.js';

@Injectable()
export class TasksService {
  uploadFile(file: any, user: User, type: string) {
    switch (type) {
      case 'creation':
        return this.uploadCreationFile(file, user);
      case 'inactivate':
        break;
      case 'movement':
        break;
      default:
        throw new BadRequestException(`El tipo ${type} no es una acción válida`);
    }
  }

  findAll() {
    return `This action returns all tasks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }

  private uploadCreationFile(file: any, user: User) {
    return 'Creando Altas';
  }
}
