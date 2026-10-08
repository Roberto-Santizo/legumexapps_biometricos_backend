import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {

  }

  async create(createUserDto: CreateUserDto) {
    //VALIDATION EMAIL
    await this._validateEmailExists(createUserDto.email);

    //TODO: HASH PASSWORD
    const user = this.userRepository.create(createUserDto);
    await this.userRepository.save(user);
    return user;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const users = await this.userRepository.find({
      take: limit,
      skip: offset
    });
    return users;
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`El usuario con ID ${id} no existe`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.email != null) await this._validateEmailExists(updateUserDto.email, id);

    const user = await this.userRepository.preload({ id, ...updateUserDto });
    if (!user) throw new NotFoundException(`El usuario con ID ${id} no existe`);

    try {
      await this.userRepository.save(user);

      return user;
    } catch (error) {
      this._handleDbExceptions(error);
    }
  }

  private _handleDbExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    throw new InternalServerErrorException("Unspected error, check server logs");
  }

  private async _validateEmailExists(email: string, id?: number) {
    const user = await this.userRepository.findOneBy({ email });

    if(user && !id) throw new BadRequestException(`El email ${email} ya se encuentra registrado`);
    if((user && id) && user.id != id) throw new BadRequestException(`El email ${email} ya se encuentra registrado`);
    
    return user;
  }
}
