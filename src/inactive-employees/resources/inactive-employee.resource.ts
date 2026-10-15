import { InactiveEmployee } from "../entities/inactive-employee.entity.js";
import { InactiveEmployeeDetailInterface, InactiveEmployeeInterface } from "../interfaces/index.js";

export class InactiveEmployeeResource {
    static inactiveEmployeeCollection(inactiveEmployees: InactiveEmployee[]) {
        return inactiveEmployees.map(inactiveEmploye => this.inactiveEmployeeResource(inactiveEmploye));
    }

    static inactiveEmployeeResource(inactiveEmployee: InactiveEmployee): InactiveEmployeeInterface {
        return {
            id: inactiveEmployee.id,
            name: inactiveEmployee.name,
            last_name: inactiveEmployee.last_name,
            pin: inactiveEmployee.pin,
            department: inactiveEmployee.authDepartment.name,
            leave_date: inactiveEmployee.leave_date
        }
    }

     static inactiveEmployeeDetailResource(inactiveEmployee: InactiveEmployee): InactiveEmployeeDetailInterface {
        return {
            id: inactiveEmployee.id,
            name: inactiveEmployee.name,
            last_name: inactiveEmployee.last_name,
            pin: inactiveEmployee.pin,
            department: inactiveEmployee.authDepartment.name,
            leave_date: inactiveEmployee.leave_date,
            creater_code: inactiveEmployee.creater_code,
            creater_name: inactiveEmployee.creater_name,
            updater_code: inactiveEmployee.updater_code,
            updater_name: inactiveEmployee.updater_name,
        }
    }
}