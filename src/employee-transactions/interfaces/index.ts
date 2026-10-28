export interface EmployeeTransactionResourceInterface {
    id: string;
    dept_code: string;
    dept_name: string;
    dev_alias: string;
    event_time: string;
    last_name: string;
    name: string;
    pin: string;
}

export interface TransactionReportRow {
    pin: string;
    name: string;
    last_name: string;
    dept_name: string;
    first_event_time: Date;
    last_event_time: Date;
}