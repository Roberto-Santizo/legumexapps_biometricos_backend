import { BiotimeServiceDatasource } from '../abstracts/biotime-service.abstract.js';
import { CreateDepartmentDto } from '../../departments/dto/create-department.dto.js';
import { Department } from '../../departments/entities/department.entity.js';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_FINCAS_CONNECTION } from '../../common/constants/connections.js';
import { Repository } from 'typeorm';

@Injectable()
export class BiotimeService implements BiotimeServiceDatasource {
    constructor(
        @InjectRepository(Department, MSSQL_FINCAS_CONNECTION)
        private readonly departmentRepository: Repository<Department>
    ){}

    createDepartment(payload: CreateDepartmentDto): Promise<string> {
        throw new Error('Method not implemented.');
    }
}
