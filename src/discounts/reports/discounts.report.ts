import { DiscountReportRow } from "../interfaces/index.js";
import { Excel } from "../../common/classes/excel.class.js";
import ExcelJS from 'exceljs';

export class DiscountsReport extends Excel<DiscountReportRow> {
    constructor(public discounts: DiscountReportRow[]) {
        super(discounts);
    }

    title() { return 'Descuentos'; }
    headings() {
        return ['Código', 'Monto', 'Fecha'];
    }
    map(d: DiscountReportRow) { return [d.code, Number(d.amount), this.formatDate(d.date)]; }

    private formatDate(value: Date | string) {
        return new Date(value).toLocaleDateString('es-GT', { timeZone: 'UTC' });
    }

    protected async build(ws: ExcelJS.Worksheet) {
        await super.build(ws);
        ws.getColumn(2).numFmt = '#,##0.00';
    }
}
