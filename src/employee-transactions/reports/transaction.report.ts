import { Excel } from "../../common/classes/excel.class.js";
import { TransactionReportRow } from "../interfaces/index.js";
import ExcelJS from 'exceljs';

export class TransactionsExport extends Excel<TransactionReportRow> {
    constructor(public transactions: TransactionReportRow[]) {
        super(transactions);
    }

    title() { return 'Marcajes'; }
    headings() {
        return [
            'Nombre', 'Código', 'Posición', 'Departamento',
            { header: 'Primer Marcaje', width: 20 },
            { header: 'Ultimo Marcaje', width: 20 },
        ];
    }
    map(t: TransactionReportRow) { return [t.name, t.pin, t.last_name, t.dept_name, this.formatDate(t.first_event_time), this.formatDate(t.last_event_time)]; }

    private formatDate(value: Date) { return new Date(value).toLocaleString('es-GT'); }

    protected async build(ws: ExcelJS.Worksheet) {
        await super.build(ws);

        const total = ws.addRow(['Total', this.data.length]);
        total.font = { bold: true };
    }
}
