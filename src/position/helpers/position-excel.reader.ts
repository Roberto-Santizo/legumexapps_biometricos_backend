import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PositionRow } from '../interfaces/index.js';
import ExcelJS from 'exceljs';

const HEADER_ROW = 1;
const CODE_COLUMN = 1;
const NAME_COLUMN = 2;

export const readPositionRows = async (buffer: any): Promise<PositionRow[]> => {
    const worksheet = await loadWorksheet(buffer);
    const rows: PositionRow[] = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === HEADER_ROW) return;
        rows.push(toPositionRow(row, rowNumber));
    });

    if (rows.length === 0) throw new BadRequestException('El archivo no contiene posiciones para registrar');

    return rows;
}

const loadWorksheet = async (buffer: any) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) throw new NotFoundException('No se encontró la hoja de Excel');
    return worksheet;
}

const toPositionRow = (row: ExcelJS.Row, rowNumber: number): PositionRow => {
    const code = row.getCell(CODE_COLUMN).text.trim();
    const name = row.getCell(NAME_COLUMN).text.trim();

    if (!code || !name) throw new BadRequestException(`Fila ${rowNumber}: el código y el nombre de la posición son obligatorios`);

    return { rowNumber, code, name };
}
