import { CreateEmployeeDto } from '../dto/create-employee.dto.js';
import { Http } from '../../common/config/http.js';
import { InactiveEmployeeDto } from '../dto/inactive-employee.dto.js';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ZkBioaccessDatasource } from '../abstracts/zkbioaccess-datasource.js';

@Injectable()
export class ZkBioaccessService implements ZkBioaccessDatasource {

    constructor(
        private readonly http: Http
    ) { }

    async updateEmployeePhoto(pin: string, image: string): Promise<boolean> {
        const response: any = await this.http.post('/person/updatePersonnelPhoto', { pin: pin, personPhoto: image });
        if (response.code == -63) return false;
        return true;
    }

    async reActivateEmployee(pin: string): Promise<boolean> {
        try {
            await this.http.post('/person/reinstated', { pin: pin });
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException("Hubo un error en la creación/actualización del empleado");
        }
    }

    async inactivateEmployee(inactiveEmployeeDto: InactiveEmployeeDto): Promise<boolean> {
        try {
            await this.http.post('/person/leave', inactiveEmployeeDto);
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException("Hubo un error en la creación/actualización del empleado");
        }
    }

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
