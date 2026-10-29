export interface DateRange {
    start: Date;
    // Límite superior exclusivo (día siguiente a end_date)
    end: Date;
}

export interface DashboardSummaryInterface {
    employees_total: number;
    departments_total: number;
    positions_total: number;
    positions_occupied: number;
    positions_vacant: number;
    transactions_today: number;
    employees_marked_today: number;
    tasks_pending: number;
    tasks_failed: number;
    inactive_employees_in_range: number;
    photos_total: number;
}

export interface DepartmentCountInterface {
    dept_id: string;
    code: string;
    name: string;
    total: number;
}

export interface DashboardEmployeesInterface {
    total: number;
    with_position: number;
    without_position: number;
    by_department: DepartmentCountInterface[];
}

export interface VacantPositionInterface {
    id: string;
    code: string;
    name: string;
}

export interface DashboardPositionsInterface {
    total: number;
    occupied: number;
    vacant: number;
    vacant_list: VacantPositionInterface[];
}

export interface DailyTransactionsInterface {
    date: string;
    total: number;
    unique_employees: number;
}

export interface DeviceTransactionsInterface {
    dev_alias: string;
    total: number;
}

export interface DepartmentTransactionsInterface {
    dept_name: string;
    total: number;
}

export interface DashboardTransactionsInterface {
    start_date: string;
    end_date: string;
    total: number;
    unique_employees: number;
    daily: DailyTransactionsInterface[];
    by_device: DeviceTransactionsInterface[];
    by_department: DepartmentTransactionsInterface[];
}

export interface TaskStatusCountInterface {
    pendiente: number;
    completada: number;
    fallida: number;
}

export interface TaskTypeCountInterface extends TaskStatusCountInterface {
    type: string;
    total: number;
}

export interface TaskSummaryInterface {
    id: string;
    type: string;
    status: string;
    pin: string;
    scheduled_at: string;
    attempts: number;
    last_error: string | null;
    created_by: string;
}

export interface DashboardTasksInterface {
    start_date: string;
    end_date: string;
    by_status: TaskStatusCountInterface;
    by_type: TaskTypeCountInterface[];
    upcoming: TaskSummaryInterface[];
    recent_failed: TaskSummaryInterface[];
}
