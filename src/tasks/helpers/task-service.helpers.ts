import { BadRequestException } from '@nestjs/common';
import { CreationPayload, InactivatePayload, InactivationField, MovementPayload } from '../interfaces/index.js';
import { Employee } from '../../employees/entities/employee.entity.js';
import ExcelJS from 'exceljs';

const FORMAT_ERROR = 'Asegurese que el excel cumpla con el formato esperado';

const getCellText = (row: ExcelJS.Row, column: number): string => {
    const cell = row.getCell(column);
    if (cell.value === null || cell.value === undefined) return '';
    return cell.text.trim();
}

const getCellDate = (row: ExcelJS.Row, column: number): string => {
    const value = row.getCell(column).value;
    const raw = value !== null && typeof value === 'object' && 'result' in value ? value.result : value;
    if (raw instanceof Date) return raw.toISOString().slice(0, 10);

    const text = getCellText(row, column);
    if (!text) return '';

    const date = new Date(`${text}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) {
        throw new BadRequestException(`La fecha programada ${text} debe tener el formato YYYY-MM-DD`);
    }

    return text;
}

const getCellInteger = (row: ExcelJS.Row, column: number, label: string): number | null => {
    const text = getCellText(row, column);
    if (!text) return null;
    if (!/^\d+$/.test(text)) throw new BadRequestException(`${label} ${text} debe ser un número entero`);
    return Number(text);
}

const getPlanificationWeek = (row: ExcelJS.Row, weekColumn: number, yearColumn: number) => {
    const week = getCellInteger(row, weekColumn, 'La semana');
    const year = getCellInteger(row, yearColumn, 'El año');

    if (week === null && year === null) return null;
    if (week === null || year === null) throw new BadRequestException('Debe indicar la semana y el año de la planificación, o dejar ambas columnas vacías');
    if (week < 1 || week > 53) throw new BadRequestException(`La semana ${week} no es válida (1-53)`);

    return { week, year };
}

export const getCreationTaskRowValues = (row: ExcelJS.Row) => {
    const position = getCellText(row, 1);
    const code = getCellText(row, 2);
    const name = getCellText(row, 3);
    const lastName = getCellText(row, 4);
    const deptCode = getCellText(row, 5);
    const accLevelName = getCellText(row, 6);
    const scheduledAt = getCellDate(row, 7);
    const planificationWeek = getPlanificationWeek(row, 8, 9);

    if (!code || !deptCode || !accLevelName || !scheduledAt || !name || !lastName) throw new BadRequestException(FORMAT_ERROR);

    return { position, code, name, lastName, scheduledAt, deptCode, accLevelName, planificationWeek }
}

export const getMovementTaskRowValues = (row: ExcelJS.Row) => {
    const position = getCellText(row, 1);
    const code = getCellText(row, 2);
    const deptCode = getCellText(row, 3);
    const accLevelName = getCellText(row, 4);
    const scheduledAt = getCellDate(row, 5);
    const planificationWeek = getPlanificationWeek(row, 6, 7);

    if (!position || !code || !deptCode || !accLevelName || !scheduledAt) throw new BadRequestException(FORMAT_ERROR);

    return { position, code, scheduledAt, deptCode, accLevelName, planificationWeek }
}

export const getInactivationTaskRowValues = (row: ExcelJS.Row) => {
    const code = getCellText(row, 1);
    const scheduledAt = getCellDate(row, 2);
    const type = getCellText(row, 3).toUpperCase() as InactivationField;
    const planificationWeek = getPlanificationWeek(row, 4, 5);

    if (!code || !scheduledAt || !type) throw new BadRequestException(FORMAT_ERROR);
    if (!Object.values(InactivationField).includes(type)) throw new BadRequestException(`El tipo de baja ${type} no es válido (${Object.values(InactivationField).join(' o ')})`);

    return { code, scheduledAt, type, planificationWeek }
}

export const createNewTaskPayload = (name: string, lastName: string, pin: string, deptCode: string, accLevelIds: string, position_id?: string): CreationPayload => {
    return { name, lastName, pin, deptCode, accLevelIds, position_id };
}

export const createNewTaskMovementPayload = (position: string, pin: string, deptCode: string, accLevelIds: string, position_id: string, name?: string, lastName?: string): MovementPayload => {
    return { pin, deptCode, accLevelIds, position, name, lastName, position_id };
}

export const createNewTaskInactivationPayload = (code: string, scheduledAt: string, type: InactivationField): InactivatePayload => {
    return {
        pin: code,
        leaveType: 1,
        leaveDate: scheduledAt,
        inactivationType: type
    }
}

export const formatEmployeeEntity = (employee: Employee): Record<string, unknown> => {
    return {
        'code': employee.pin,
        'position': employee.last_name,
        'position_id': employee.position_id ?? null,
        'department': employee.authDepartment.name,
        'deptCode': employee.authDepartment.code
    }
}