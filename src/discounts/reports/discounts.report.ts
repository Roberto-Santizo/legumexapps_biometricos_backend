import { DiscountReportRow } from "../interfaces/index.js";
import { Excel } from "../../common/classes/excel.class.js";
import ExcelJS from 'exceljs';

export class DiscountsReport extends Excel<DiscountReportRow> {
    constructor(public transactions: DiscountReportRow[]) {
        super(transactions);
    }

    title() { return 'Descuentos'; }
    headings() {
        return ['Código', 'Monto', 'Fecha'];
    }
    map(t: DiscountReportRow) { return [t.code, t.amount, t.date]; }

    protected async build(ws: ExcelJS.Worksheet) {
        await super.build(ws);

        const total = ws.addRow(['Monto', this.data.length]);
        total.font = { bold: true };
    }
}
