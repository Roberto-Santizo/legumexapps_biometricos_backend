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
        const response = await this.http.post('/person/leave', inactiveEmployeeDto);
        console.log(response);
        return true;
    }

    async createOrUpdateEmployee(createEmployeeDto: CreateEmployeeDto, image?: string): Promise<boolean> {
        const response: any = await this.http.post('/person/add', { ...createEmployeeDto, personPhoto: image });
        if (response.code == -63) throw new BadRequestException(response.message);
        if (response.code == -29) throw new BadRequestException(response.message);
        return true;
    }
}
