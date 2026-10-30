import { Planification } from "../entities/planification.entity.js";
import { PlanificationCounts, PlanificationDetailInterface, PlanificationListInterface, PlanificationResourceInterface } from "../interfaces/index.js";
import { TaskResourceInterface } from "../../tasks/interfaces/index.js";

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

    static withCounts(planification: Planification, counts: PlanificationCounts): PlanificationListInterface {
        return { ...this.planificationResource(planification), counts };
    }

    static withTasks(planification: Planification, tasks: TaskResourceInterface[]): PlanificationDetailInterface {
        return { ...this.planificationResource(planification), tasks };
    }
}
