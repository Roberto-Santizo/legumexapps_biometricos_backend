import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BiotimeServiceDatasource } from '../abstracts/biotime-service.abstract.js';
import { CreateDepartmentDto } from '../../departments/dto/create-department.dto.js';
import { HttpFincas } from '../../common/config/http-fincas.js';
import { CreateEmployeesFincaDto } from '../../employees-finca/dto/create-employees-finca.dto.js';

@Injectable()
export class BiotimeService implements BiotimeServiceDatasource {
    private logger = new Logger(BiotimeService.name);

    constructor(
        private readonly http: HttpFincas,
    ) { }

    async createEmployee(payload: CreateEmployeesFincaDto): Promise<string> {
        try {
            await this.http.post('/personnel/api/employees/', { ...payload, emp_code: "1161", company: 1 });

            return 'Empleado Creado Correctamente';
        } catch (error: any) {
            this.logger.debug(error);
            throw new BadRequestException('Hubo un error al crear el empleado');
        }
    }

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
