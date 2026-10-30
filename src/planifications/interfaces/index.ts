export interface PlanificationResourceInterface {
    id: string;
    year: number;
    week: number;
    start_date: string;
    end_date: string;
    created_by: string;
}

export interface PlanificationCounts {
    total: number;
    by_type: { movimiento: number; alta: number; baja: number };
    by_status: { pendiente: number; completada: number; fallida: number };
}

export interface PlanificationListInterface extends PlanificationResourceInterface {
    counts: PlanificationCounts;
}
