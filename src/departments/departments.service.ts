import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BiotimeService } from '../biometrics/services/biotime.service.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { Department } from './entities/department.entity.js';
import { DepartmentQueryDto } from './dto/department-query.dto.js';
import { Filters } from '../common/providers/filters.js';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_FINCAS_CONNECTION } from '../common/constants/connections.js';
import { paginate } from '../common/helpers/paginate.js';
import { Repository } from 'typeorm';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department, MSSQL_FINCAS_CONNECTION)
    private readonly departmentRepository: Repository<Department>,

    private readonly filters: Filters,
    private readonly biotimeService: BiotimeService

  ) { }

  async create(createDepartmentDto: CreateDepartmentDto) {
    const exists = await this.findOneByCode(createDepartmentDto.dept_code);
    if (exists) throw new BadRequestException(`El departamento con código ${createDepartmentDto.dept_code} ya existe`);
    return createDepartmentDto;
  }

  async findAll(departmentQueryDto: DepartmentQueryDto) {
    const { limit = 10, offset = 0 } = departmentQueryDto;
    const where = this.filters.buildWhere<Department, DepartmentQueryDto>(departmentQueryDto, { like: ['dept_name'] });

    const [departments, total] = await this.departmentRepository.findAndCount({
      take: limit,
      skip: offset,
      where
    });

    return paginate(departments, total, limit, offset);;
  }

  async findOne(id: number) {
    const department = await this.departmentRepository.findOneBy({ id });
    if (!department) throw new NotFoundException(`El departamento con ID ${id} no existe`);
    return department;
  }

  async findOneByCode(id: string) {
    const department = await this.departmentRepository.findOneBy({ dept_code: id });
    return department;
  }

  update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    return `This action updates a #${id} department`;
  }
}
