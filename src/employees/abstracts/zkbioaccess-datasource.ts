import { CreateEmployeeDto } from "../dto/create-employee.dto.js";

export abstract class ZkBioaccessDatasource {
    abstract createOrUpdateEmployee(createEmployeeDto: CreateEmployeeDto): Promise<boolean>;
}