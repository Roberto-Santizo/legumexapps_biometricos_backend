import { TaskTypeEnum } from "../entities/task.entity.js";

interface CreationPayload {
    type: TaskTypeEnum.creation;
    name: string;
    lastName: string;
    deptCode: string;
    accLevelIds: string;
    accStartTime?: string;
    accEndTime?: string;
}

interface MovementPayload {
    type: TaskTypeEnum.movement;
    lastName?: string;
    deptCode?: string;
}

interface InactivatePayload {
    type: TaskTypeEnum.inactivate;
    leaveType: number;
    leaveDate: string;
}

export type TaskPayload = CreationPayload | MovementPayload | InactivatePayload;