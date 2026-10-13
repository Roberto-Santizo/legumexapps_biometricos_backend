import { Employee } from "../entities/employee.entity.js";
import { EmployeeList } from "../interfaces/interfaces.js";

export class EmployeeResource {
    static collection(employees: Employee[]): EmployeeList[] {
        return employees.map(employee => this.employeeList(employee));
    }

    static employeeList(employee: Employee): EmployeeList {
        return {
            id: employee.id,
            name: employee.name,
            last_name: employee.last_name,
            pin: employee.pin,
            createdBy: employee.creater_name,
            updatedBy: employee.updater_name,
            department: employee.authDepartment.name
        };
    }
}