import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BiotimeServiceDatasource } from '../abstracts/biotime-service.abstract.js';
import { CreateDepartmentDto } from '../../departments/dto/create-department.dto.js';
import { HttpFincas } from '../../common/config/http-fincas.js';

@Injectable()
export class BiotimeService implements BiotimeServiceDatasource {
    private logger = new Logger(BiotimeService.name);

    constructor(
        private readonly http: HttpFincas,
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
