import { AccLevelEmployee } from "../entities/acc_level_employee.js";
import { AccLevelEmployeeInterface } from "../interfaces/index.js";

export class AccLevelEmployeeResource {
    static accLevelEmployeeCollection(accLevelEmployees: AccLevelEmployee[]) {
        return accLevelEmployees.map(accLevelEmployee => this.accLevelEmplyeeResource(accLevelEmployee))
    }

    static accLevelEmplyeeResource(accLevelEmployee: AccLevelEmployee): AccLevelEmployeeInterface {
        return {
            id: accLevelEmployee.id,
            level_id: accLevelEmployee.level_id,
            pers_person_id: accLevelEmployee.pers_person_id,
            level_name: accLevelEmployee.accLevel.name,
        }
    }
}