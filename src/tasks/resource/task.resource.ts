import { DateHandler } from "../../common/abstracts/date-handler.abstract.js";
import { Task } from "../entities/task.entity.js";
import { TaskResourceInterface } from "../interfaces/index.js";

export class TaskResource {
    constructor(private readonly dateHandle: DateHandler) { }


    collection = (tasks: Task[]): TaskResourceInterface[] => {
        return tasks.map(task => this.taskEntityToJson(task));
    }

    taskEntityToJson = (task: Task): TaskResourceInterface => {
        return {
            id: task.id,
            type: task.type,
            status: task.status,
            created_by: task.created_by.name,
            payload: task.payload,
            previous: task.previous,
            pin: task.pin,
            scheduled_at: task.scheduled_at.toString(),
            planification_id: task.planification_id ?? null,
        }
    }
}