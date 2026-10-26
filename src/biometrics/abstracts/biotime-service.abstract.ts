import { CreateDepartmentDto } from "../../departments/dto/create-department.dto.js";
import { CreateEmployeesFincaDto } from "../../employees-finca/dto/create-employees-finca.dto.js";

export abstract class BiotimeServiceDatasource {
    //DEPARTAMENTOS
    abstract createDepartment(payload: CreateDepartmentDto): Promise<string>;

    //EMPLEADOS
    abstract createEmployee(payload: CreateEmployeesFincaDto, code: number): Promise<string>;
    abstract resignEmployee(id: number): Promise<string>;
    abstract reinstatmentEmployee(id: number): Promise<string>;
}