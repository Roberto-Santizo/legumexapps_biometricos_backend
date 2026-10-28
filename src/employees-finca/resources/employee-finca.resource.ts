import { EmployeesFinca } from "../entities/employees-finca.entity.js";
import { EmployeeFincaDetailInterface, EmployeeFincaListInterface } from "../interfaces/index.js";

export class EmployeeFincaResource {
    static collection(employees: EmployeesFinca[]): EmployeeFincaListInterface[] {
        return employees.map(employee => this.employeeList(employee));
    }

    static employeeList(employee: EmployeesFinca): EmployeeFincaListInterface {
        return {
            id: employee.id,
            emp_code: `${employee.emp_code}`,
            first_name: employee.first_name,
            last_name: employee.last_name,
            department: employee.department.dept_name,
            position: employee.position.position_name,
            resign: employee.resign ? true : false
        }
    }

    static employeeDetails(employee: EmployeesFinca): EmployeeFincaDetailInterface {
        return {
            id: employee.id,
            emp_code: `${employee.emp_code}`,
            first_name: employee.first_name,
            last_name: employee.last_name,
            department: employee.department.dept_name,
            position: employee.position.position_name,
            position_id: employee.position.id,
            department_id: employee.department.id,
            resign: employee.resign ? true : false,
            areas: employee.areas.map((area) => {
                return {
                    id: area.id,
                    area_code: area.area.area_code,
                    area_name: area.area.area_name
                }
            })
        }
    }
}