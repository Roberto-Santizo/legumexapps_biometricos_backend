import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
  ) { }

  async create(createRoleDto: CreateRoleDto) {
    await this._validateRoleName(createRoleDto.name.toLowerCase());
    const role = this.roleRepository.create(createRoleDto);
    await this.roleRepository.save(role);
    return role;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const roles = await this.roleRepository.find({
      take: limit,
      skip: offset
    });

    return roles;
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) throw new NotFoundException(`El rol con el ID ${id} no existe`);
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    if (updateRoleDto.name != null) await this._validateRoleName(updateRoleDto.name);

    const role = await this.roleRepository.preload({ id, ...updateRoleDto });
    if (!role) throw new NotFoundException(`El rol con ID ${id} no existe`);

    try {
      await this.roleRepository.save(role);

      return role;
    } catch (error) {
      this._handleDbExceptions(error);
    }
    return role;
  }

  private _handleDbExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    throw new InternalServerErrorException("Unspected error, check server logs");
  }
  private async _validateRoleName(name: string, id?: number) {
    const role = await this.roleRepository.findOneBy({ name });
    if (role && !id) throw new BadRequestException(`El rol con nombre ${name} ya se encuentra registrado`);
    if ((role && id) && role.id != id) throw new BadRequestException(`El rol con nombre ${name} ya se encuentra registrado`);
    return role;
  }
}
