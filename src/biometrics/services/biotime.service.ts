import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BiotimeServiceDatasource } from '../abstracts/biotime-service.abstract.js';
import { CreateDepartmentDto } from '../../departments/dto/create-department.dto.js';
import { HttpFincas } from '../../common/config/http-fincas.js';
import { CreateEmployeesFincaDto } from '../../employees-finca/dto/create-employees-finca.dto.js';
import { DateHandlerService } from '../../common/services/date-handler.service.js';
import { UpdateEmployeesFincaDto } from '../../employees-finca/dto/update-employees-finca.dto.js';

@Injectable()
export class BiotimeService implements BiotimeServiceDatasource {
    private logger = new Logger(BiotimeService.name);

    constructor(
        private readonly dateService: DateHandlerService,
        private readonly http: HttpFincas,
    ) { }

    async updateEmployee(payload: UpdateEmployeesFincaDto, id: number): Promise<string> {
        try {
            await this.http.patch(`/personnel/api/employees/${id}/`, payload)

            return 'Empleado actualizado correctamente';
        } catch (error: any) {
            this.logger.debug(error);
            throw new BadRequestException('Hubo un error al actualizar el empleado');
        }
    }

    async reinstatmentEmployee(id: number): Promise<string> {
        try {
            await this.http.post('/personnel/api/resigns/reinstatement/', {
                "employee": id,
            });

            return 'Empleado dado de alta correctamente';
        } catch (error: any) {
            this.logger.debug(error);
            throw new BadRequestException('Hubo un error al dar de alta al empleado');
        }
    }

    async resignEmployee(id: number): Promise<string> {
        try {
            await this.http.post('/personnel/api/employees/adjust_resign/', {
                "resign_date": this.dateService.getCurrentDate('yyyy-MM-dd'),
                "employees": [id],
                "resign_type": 1,
                "reason": "Baja",
                "disableatt": true
            });

            return 'Empleado dado de baja correctamente';
        } catch (error: any) {
            this.logger.debug(error);
            throw new BadRequestException('Hubo un error al dar de baja al empleado');
        }
    }

    async createEmployee(payload: CreateEmployeesFincaDto, code: number): Promise<string> {
        try {
            const { area, ...rest } = payload;
            await this.http.post('/personnel/api/employees/', { ...rest, area: [area], emp_code: `${code}`, company: 1 });

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
