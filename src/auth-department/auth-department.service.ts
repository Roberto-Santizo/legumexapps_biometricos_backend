import { AuthDepartment } from './entities/auth-department.entity.js';
import { AuthDepartmentQueryDto } from './dto/auth-department-query.dto.js';
import { CreateAuthDepartmentDto } from './dto/create-auth-department.dto.js';
import { DatabaseHelpers } from '../common/providers/database-helpers.js';
import { DateHandlerService } from '../common/services/date-handler.service.js';
import { Filters } from '../common/providers/filters.js';
import { paginate } from '../common/helpers/paginate.js';
import { IdGeneratorService } from '../common/services/id-generator.service.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { Repository } from 'typeorm';
import { UpdateAuthDepartmentDto } from './dto/update-auth-department.dto.js';
import { User } from '../auth/entities/user.entity.js';

@Injectable()
export class AuthDepartmentService {
  constructor(
    @InjectRepository(AuthDepartment, MSSQL_CONNECTION)
    private readonly authDepartmentRepository: Repository<AuthDepartment>,

    private readonly filters: Filters,
    private readonly databaseHelpers: DatabaseHelpers,
    private readonly idGenerator: IdGeneratorService,
    private readonly dateHandler: DateHandlerService
  ) { }

  async create(createAuthDepartmentDto: CreateAuthDepartmentDto, user: User) {
    try {
      const id = this.idGenerator.generate32CaracterId();
      const department = this.authDepartmentRepository.create({
        ...createAuthDepartmentDto,
        id,
        creater_name: user.name,
        creater_code: user.name,
        parent_id: "4028898594b7f9660194b7fb25b00004",
        create_time: this.dateHandler.getCurrentDate(),
        sort: '99999'
      });

      const dbDepartment = await this.authDepartmentRepository.save(department);
      return dbDepartment;
    } catch (error) {
      this.databaseHelpers.handleExeptions(error);
    }

  }

  async findAll(authDepartmentQueryDto: AuthDepartmentQueryDto) {
    const { limit = 10, offset = 0 } = authDepartmentQueryDto;
    const where = this.filters.buildWhere<AuthDepartment, AuthDepartmentQueryDto>(authDepartmentQueryDto, { like: ['code', 'name'] });

    const [departments, total] = await this.authDepartmentRepository.findAndCount({
      take: limit,
      skip: offset,
      where
    });

    return paginate(departments, total, limit, offset);
  }

  async findOne(id: string) {
    const authDepartment = await this.authDepartmentRepository.findOneBy({ id });
    if (!authDepartment) throw new NotFoundException(`El departamento con ID ${id} no existe`);

    return authDepartment;
  }

  async update(id: string, updateAuthDepartmentDto: UpdateAuthDepartmentDto, user: User) {
    const department = await this.authDepartmentRepository.preload({
      id,
      ...updateAuthDepartmentDto,
      update_time: this.dateHandler.getCurrentDate(),
      updater_code: user.name,
      updater_name: user.name
    });

    if (!department) throw new NotFoundException(`El departamento con ID ${id} no existe`);
    await this.authDepartmentRepository.save(department);
    return department;
  }

  async remove(id: string) {
    const department = await this.findOne(id);
    await this.authDepartmentRepository.delete(department.id);
  }
}
