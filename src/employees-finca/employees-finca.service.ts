import { CreateEmployeesFincaDto } from './dto/create-employees-finca.dto.js';
import { EmployeesFinca } from './entities/employees-finca.entity.js';
import { EmployeesFincasQueryDto } from './dto/employee-fincas-query.dto.js';
import { Filters } from '../common/providers/filters.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_FINCAS_CONNECTION } from '../common/constants/connections.js';
import { paginate } from '../common/helpers/paginate.js';
import { Repository } from 'typeorm';
import { UpdateEmployeesFincaDto } from './dto/update-employees-finca.dto.js';

@Injectable()
export class EmployeesFincaService {
  constructor(
    @InjectRepository(EmployeesFinca, MSSQL_FINCAS_CONNECTION)
    private readonly employeesFincaRepository: Repository<EmployeesFinca>,

    private readonly filters: Filters
  ) { }


  create(createEmployeesFincaDto: CreateEmployeesFincaDto) {
    return 'This action adds a new employeesFinca';
  }

  async findAll(employeesFincasQueryDto: EmployeesFincasQueryDto) {
    const { limit = 10, offset = 0 } = employeesFincasQueryDto;
    const where = this.filters.buildWhere<EmployeesFinca, EmployeesFincasQueryDto>(employeesFincasQueryDto, { like: ['first_name', 'last_name'] });

    const [employees, total] = await this.employeesFincaRepository.findAndCount({
      take: limit,
      skip: offset,
      where
    });

    return paginate(employees, total, limit, offset);
  }

  async findOne(id: number) {
    const employee = await this.employeesFincaRepository.findOneBy({ id });
    if (!employee) throw new NotFoundException(`El empleado con ID ${id} no existe`);

    return employee;
  }

  update(id: number, updateEmployeesFincaDto: UpdateEmployeesFincaDto) {
    return `This action updates a #${id} employeesFinca`;
  }
}
