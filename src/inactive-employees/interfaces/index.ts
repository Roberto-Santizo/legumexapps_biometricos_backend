export interface InactiveEmployeeInterface {
    id: string;
    pin: string;
    name: string;
    last_name: string;
    leave_date: Date;
    department: string;
}

export interface InactiveEmployeeDetailInterface extends InactiveEmployeeInterface {
    creater_code?: string;
    creater_name?: string;
    updater_code?: string;
    updater_name?: string;
}