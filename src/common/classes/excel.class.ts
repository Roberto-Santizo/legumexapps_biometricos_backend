import ExcelJS from 'exceljs';

export interface ExcelColumn {
    header: string;
    width?: number;
}

export abstract class Excel<T> {
    constructor(protected readonly data: T[]) {}

    /** Nombre de la hoja (WithTitle) */
    abstract title(): string;

    /** Nombre de las columnas (WithHeadings) */
    abstract headings(): (string | ExcelColumn)[];

    /** Convierte cada registro en una fila; usado por el `build` por defecto (WithMapping) */
    protected map?(row: T): ExcelJS.CellValue[];

    /**
     * Arma el cuerpo del reporte. Por defecto agrega una fila por registro usando `map`.
     * Sobrescribir en la clase hija para armarlo a gusto (filas, celdas, merges, totales...),
     * o llamar `super.build(worksheet)` y agregar lo extra.
     */
    protected build(worksheet: ExcelJS.Worksheet): void | Promise<void> {
        if (!this.map) throw new Error(`${this.constructor.name} debe implementar map() o sobrescribir build()`);

        worksheet.addRows(this.data.map(row => this.map!(row)));
    }

    /** Estilos de la hoja (WithStyles); por defecto encabezado en negrita y centrado */
    protected styles(worksheet: ExcelJS.Worksheet): void {
        const header = worksheet.getRow(1);
        header.font = { bold: true };
        header.alignment = { horizontal: 'center' };
    }

    async toWorkbook(): Promise<ExcelJS.Workbook> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(this.title());

        worksheet.columns = this.headings().map(column =>
            typeof column === 'string'
                ? { header: column, width: 15 }
                : { header: column.header, width: column.width ?? 15 },
        );

        await this.build(worksheet);

        this.styles(worksheet);

        return workbook;
    }

    async toBuffer(): Promise<Buffer> {
        const workbook = await this.toWorkbook();
        return Buffer.from(await workbook.xlsx.writeBuffer());
    }
}
