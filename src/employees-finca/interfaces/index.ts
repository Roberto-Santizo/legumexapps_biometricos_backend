import { AreaFincaInterface } from "../../area-finca/interfaces/index.js";

export interface EmployeeFincaListInterface {
    id: number;
    emp_code: string;
    first_name: string;
    last_name: string;
    department: string;
    position: string;
    resign: boolean;
}

export interface EmployeeFincaDetailInterface {
    id: number;
    emp_code: string;
    first_name: string;
    last_name: string;
    department: string;
    position: string;
    resign: boolean;
    areas: AreaFincaInterface[];
}