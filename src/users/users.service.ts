import { DatabaseHelpers } from '../common/providers/database-helpers.js';
import { Filters } from '../common/providers/filters.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from '../auth/entities/user.entity.js';
import { UserResource } from '../auth/resources/user.resource.js';
import { UsersQueryDto } from './dto/users-query.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly filters: Filters,
    private readonly databaseHelpers: DatabaseHelpers
  ) { }

  async findAll(usersQueryDto: UsersQueryDto) {
    const { limit = 10, offset = 0 } = usersQueryDto;
    const where = this.filters.buildWhere<User, UsersQueryDto>(usersQueryDto, { like: ['name', 'email'] });

    const users = await this.userRepository.find({
      where,
      take: limit,
      skip: offset,
    });

    return UserResource.userCollection(users);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException(`El usuario con ID ${id} no existe`);

    return UserResource.user(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.preload({ id, ...updateUserDto });
      if (!user) throw new NotFoundException(`El usuario con ID ${id} no existe`);
      await this.userRepository.save(user);

      return UserResource.user(user);
    } catch (error) {
      this.databaseHelpers.handleExeptions(error);
    }
  }

  async toggleIsActiveUser(id: string) {
    const user = await this.findOne(id);
    user.isActive = !user.isActive;
    const dbUser = await this.userRepository.save(user);
    
    return UserResource.user(dbUser);
  }
}
