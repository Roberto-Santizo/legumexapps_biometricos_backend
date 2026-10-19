import { EmployeeTransaction } from "../entities/employee-transaction.entity.js";
import { EmployeeTransactionResourceInterface } from "../interfaces/index.js";
import { DateHandler } from "../../common/abstracts/date-handler.abstract.js";

export class EmployeeTransactionsResource {
    constructor(private readonly dateHandle: DateHandler) { }

    collection(transactions: EmployeeTransaction[]): EmployeeTransactionResourceInterface[] {
        return transactions.map(transaction => this.employeeTransactionResource(transaction));
    }

    employeeTransactionResource(transaction: EmployeeTransaction): EmployeeTransactionResourceInterface {
        return {
            id: transaction.id,
            dept_code: transaction.dept_code,
            dept_name: transaction.dept_name,
            dev_alias: transaction.dev_alias,
            event_time: this.dateHandle.formatDate(transaction.event_time),
            last_name: transaction.last_name,
            name: transaction.name,
            pin: transaction.pin
        };
    }
}