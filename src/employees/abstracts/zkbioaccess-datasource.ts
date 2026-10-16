import { CreateEmployeeDto } from "../dto/create-employee.dto.js";
import { InactiveEmployeeDto } from "../dto/inactive-employee.dto.js";

export abstract class ZkBioaccessDatasource {
    abstract createOrUpdateEmployee(createEmployeeDto: CreateEmployeeDto, image: string): Promise<boolean>;
    abstract inactivateEmployee(inactiveEmployeeDto: InactiveEmployeeDto): Promise<boolean>;
    abstract reActivateEmployee(pin: string): Promise<boolean>;
    abstract updateEmployeePhoto(pin: string, image: string): Promise<boolean>;
}