import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateEmployeeDto } from '../dto/create-employee.dto.js';
import { Http } from '../../common/config/http.js';
import { InactiveEmployeeDto } from '../dto/inactive-employee.dto.js';
import { ZkBioaccessDatasource } from '../abstracts/zkbioaccess-datasource.js';

@Injectable()
export class ZkBioaccessService implements ZkBioaccessDatasource {

    constructor(
        private readonly http: Http
    ) { }

    async updateEmployeePhoto(pin: string, image: string): Promise<boolean> {
        const response: any = await this.http.post('/person/updatePersonnelPhoto', { pin: pin, personPhoto: image });
        this.handleHttpResponseCode(response);
        return true;
    }

    async reActivateEmployee(pin: string): Promise<boolean> {
        const response: any = await this.http.post('/person/reinstated', { pin: pin });
        this.handleHttpResponseCode(response);
        return true;
    }

    async inactivateEmployee(inactiveEmployeeDto: InactiveEmployeeDto): Promise<boolean> {
        const response: any = await this.http.post('/person/leave', inactiveEmployeeDto);
        this.handleHttpResponseCode(response);
        return true;
    }

    async createOrUpdateEmployee(createEmployeeDto: CreateEmployeeDto, image?: string): Promise<boolean> {
        const response: any = await this.http.post('/person/add', { ...createEmployeeDto, personPhoto: image });
        this.handleHttpResponseCode(response);
        return true;
    }

    private handleHttpResponseCode(response: any) {
        if (response.code != 0) throw new BadRequestException(response.message);
    }
}
