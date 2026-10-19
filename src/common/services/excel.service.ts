import { EmployeeTransaction } from '../../employee-transactions/entities/employee-transaction.entity.js';
import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';

@Injectable()
export class ExcelService {
    async generateTransactionsExcel(transactions: EmployeeTransaction[]): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();

        const worksheet = workbook.addWorksheet('Marcajes');

        worksheet.columns = [
            { header: 'Nombre', key: 'name', width: 10 },
            { header: 'Código', key: 'pin', width: 10 },
            { header: 'Posición', key: 'last_name', width: 10 },
            { header: 'Departamento', key: 'dept_name', width: 10 },
            { header: 'Marcaje', key: 'event_time', width: 10 },
        ];

        transactions.map(transaction => worksheet.addRow({
            name: transaction.name,
            pin: transaction.pin,
            last_name: transaction.last_name,
            dept_name: transaction.dept_name,
            event_time: transaction.event_time
        }));

        worksheet.getRow(1).font = {
            bold: true,
        };

        worksheet.getRow(1).alignment = {
            horizontal: 'center',
        };

        return Buffer.from(await workbook.xlsx.writeBuffer());
    }
}
