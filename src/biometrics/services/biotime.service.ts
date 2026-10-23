import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BiotimeServiceDatasource } from '../abstracts/biotime-service.abstract.js';
import { CreateDepartmentDto } from '../../departments/dto/create-department.dto.js';
import { Department } from '../../departments/entities/department.entity.js';
import { HttpFincas } from '../../common/config/http-fincas.js';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_FINCAS_CONNECTION } from '../../common/constants/connections.js';
import { Repository } from 'typeorm';

@Injectable()
export class BiotimeService implements BiotimeServiceDatasource {
    private logger = new Logger(BiotimeService.name);

    constructor(
        private readonly http: HttpFincas,

        @InjectRepository(Department, MSSQL_FINCAS_CONNECTION)
        private readonly departmentRepository: Repository<Department>
    ) { }

    async createDepartment(payload: CreateDepartmentDto): Promise<string> {
        try {
            await this.http.post('/personnel/api/departments/', payload);

            return 'Departamento Creado Correctamente';
        } catch (error: any) {
            this.logger.debug(error);
            throw new BadRequestException('Hubo un error al crear el departamento');
        }
    }
}
