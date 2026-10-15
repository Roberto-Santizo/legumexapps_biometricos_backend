import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ZkBioaccessDatasource } from '../abstracts/zkbioaccess-datasource.js';
import { Http } from '../../common/config/http.js';
import { CreateEmployeeDto } from '../dto/create-employee.dto.js';

@Injectable()
export class ZkBioaccessService implements ZkBioaccessDatasource {

    constructor(
        private readonly http: Http
    ) { }

    async createOrUpdateEmployee(createEmployeeDto: CreateEmployeeDto): Promise<boolean> {
        try {
            await this.http.post('/person/add', createEmployeeDto);
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException("Hubo un error en la creación/actualización del empleado");
        }
    }
}
