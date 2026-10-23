import { CreateDepartmentDto } from "../../departments/dto/create-department.dto.js";

export abstract class BiotimeServiceDatasource {
    abstract createDepartment(payload: CreateDepartmentDto): Promise<string>;
}