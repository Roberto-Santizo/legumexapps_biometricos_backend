import { BadRequestException } from '@nestjs/common';
import { CreationPayload, InactivatePayload, MovementPayload } from '../interfaces/index.js';
import ExcelJS from 'exceljs';
import { Employee } from '../../employees/entities/employee.entity.js';

export const getCreationTaskRowValues = (row: ExcelJS.Row) => {
    const position = row.getCell(1).value as string;
    const code = row.getCell(2).value as string;
    const name = row.getCell(3).value as string;
    const scheduledAt = row.getCell(6).value as string;
    const deptCode = row.getCell(4).value as string;
    const accLevelName = row.getCell(5).value as string;

    if (!position || !code || !deptCode || !accLevelName || !scheduledAt || !name) throw new BadRequestException("Asegurese que el excel cumpla con el formato esperado");

    return { position, code, name, scheduledAt, deptCode, accLevelName }
}

export const getMovementTaskRowValues = (row: ExcelJS.Row) => {
    const position = row.getCell(1).value as string;
    const code = row.getCell(2).value as string;
    const deptCode = row.getCell(3).value as string;
    const accLevelName = row.getCell(4).value as string;
    const scheduledAt = row.getCell(5).value as string;

    if (!position || !code || !deptCode || !accLevelName || !scheduledAt) throw new BadRequestException("Asegurese que el excel cumpla con el formato esperado");

    return { position, code, scheduledAt, deptCode, accLevelName }
}

export const getInactivationTaskRowValues = (row: ExcelJS.Row) => {
    const code = row.getCell(1).value as string;
    const scheduledAt = row.getCell(2).value as string;

    if (!code || !scheduledAt) throw new BadRequestException("Asegurese que el excel cumpla con el formato esperado");

    return { code, scheduledAt }
}

export const createNewTaskPayload = (name: string, lastName: string, pin: string, deptCode: string, accLevelIds: string): CreationPayload => {
    return { name, lastName, pin, deptCode, accLevelIds };
}

export const createNewTaskMovementPayload = (position: string, pin: string, deptCode: string, accLevelIds: string, name: string, lastName: string): MovementPayload => {
    return { pin, deptCode, accLevelIds, position, name, lastName };
}

export const createNewTaskInactivationPayload = (code: string, scheduledAt: string): InactivatePayload => {
    return {
        pin: code,
        leaveType: 1,
        leaveDate: scheduledAt
    }
}

export const formatEmployeeEntity = (employee: Employee): Record<string, unknown> => {
    return {
        'code': employee.pin,
        'position': employee.last_name,
        'department': employee.authDepartment.name,
        'deptCode': employee.authDepartment.code
    }
}