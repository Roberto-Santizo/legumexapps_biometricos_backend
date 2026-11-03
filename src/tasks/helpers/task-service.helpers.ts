import { BadRequestException } from '@nestjs/common';
import { CreationPayload, InactivatePayload, InactivationField, MovementPayload } from '../interfaces/index.js';
import { Employee } from '../../employees/entities/employee.entity.js';
import ExcelJS from 'exceljs';

export const getCreationTaskRowValues = (row: ExcelJS.Row) => {
    const position = row.getCell(1).value as string;
    const code = row.getCell(2).value as string;
    const name = row.getCell(3).value as string;
    const deptCode = row.getCell(4).value as string;
    const accLevelName = row.getCell(5).value as string;
    const scheduledAt = row.getCell(6).value as string;

    if (!code || !deptCode || !accLevelName || !scheduledAt || !name) throw new BadRequestException("Asegurese que el excel cumpla con el formato esperado");

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
    const type = row.getCell(3).value as InactivationField;

    if (!code || !scheduledAt || !type) throw new BadRequestException("Asegurese que el excel cumpla con el formato esperado");
    if (!Object.values(InactivationField).includes(type)) throw new BadRequestException(`El tipo de baja ${type} no es válido (${Object.values(InactivationField).join(' o ')})`);

    return { code, scheduledAt, type }
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