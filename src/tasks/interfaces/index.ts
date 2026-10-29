export interface CreationPayload {
    pin: string;
    name: string;
    lastName: string;
    deptCode: string;
    accLevelIds: string;
    position_id: string;
    accStartTime?: string;
    accEndTime?: string;
}

export interface MovementPayload {
    pin: string;
    name: string;
    lastName: string;
    position: string;
    position_id: string;
    deptCode: string;
    accLevelIds: string;
}

export interface InactivatePayload {
    pin: string;
    leaveType: number;
    leaveDate: string;
}

export interface TaskResourceInterface {
    id: string;
    type: string;
    status: string;
    pin: string;
    payload: TaskPayload;
    previous: Record<string, unknown> | null;
    scheduled_at: string;
    created_by: string;
}

export type TaskPayload = CreationPayload | MovementPayload | InactivatePayload;