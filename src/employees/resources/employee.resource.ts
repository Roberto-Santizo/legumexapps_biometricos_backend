import { Employee } from "../entities/employee.entity.js";
import { EmployeeList } from "../interfaces/interfaces.js";

export class EmployeeResource {

    static collection(employees: Employee[]): EmployeeList[] {
        return employees.map(employee => this.employeeList(employee));
    }

    static employeeList(employee: Employee): EmployeeList {
        const hasPhoto = employee.photo_path ? true : false;
        return {
            id: employee.id,
            name: employee.name,
            last_name: employee.last_name,
            pin: employee.pin,
            createdBy: employee.creater_name,
            updatedBy: employee.updater_name,
            department: employee.authDepartment.name,
            departmentCode: employee.authDepartment.code,
            hasPhoto: hasPhoto,
            photoUrl: hasPhoto ? this.getPhotoUrl(employee.pin) : '',
            position: employee.position ? employee.position.code : 'Sin posición asignada',
            position_id: employee.position_id
        };
    }

    static getPhotoUrl(key: string) {
        const appUrl = process.env.APP_URL;
        return `${appUrl}/api/photos/${encodeURIComponent(key)}.jpg`;
    }
}