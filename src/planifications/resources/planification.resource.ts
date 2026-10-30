import { Planification } from "../entities/planification.entity.js";
import { PlanificationResourceInterface } from "../interfaces/index.js";

export class PlanificationResource {
    static collection(planifications: Planification[]) {
        return planifications.map(planification => this.planificationResource(planification));
    }

    static planificationResource(planification: Planification): PlanificationResourceInterface {
        return {
            id: planification.id,
            year: planification.year,
            week: planification.week,
            start_date: planification.start_date.toString(),
            end_date: planification.end_date.toString(),
            created_by: planification.created_by.name,
        }
    }
}
