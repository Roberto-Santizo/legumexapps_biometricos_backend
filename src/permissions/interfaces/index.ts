import { PermissionTypeEnum, SalaryStatusEnum } from "../entities/permission.entity.js";

export interface PermissionEmployeeInterface {
    pin: string;
    name: string;
    department: string;
    position: string | null;
}

export interface PermissionSubstituteInterface {
    pin: string;
    name: string;
}

export interface PermissionSignaturesInterface {
    employee: boolean;
    substitute: boolean;
    supervisor: boolean;
    floor_auditor: boolean;
    hr: boolean;
}

export interface PermissionSignatureFiles {
    employee_signature?: Express.Multer.File[];
    substitute_signature?: Express.Multer.File[];
    supervisor_signature?: Express.Multer.File[];
    floor_auditor_signature?: Express.Multer.File[];
}

export interface PermissionResourceInterface {
    id: string;
    folio: number;
    date: string;
    employee: PermissionEmployeeInterface;
    substitute: PermissionSubstituteInterface | null;
    type: PermissionTypeEnum;
    reason: string;
    salary_status: SalaryStatusEnum;
    shift_start: string;
    shift_end: string;
    signatures: PermissionSignaturesInterface;
    is_valid: boolean;
    hr_signed_by: string | null;
    hr_signed_at: Date | null;
    created_by: string;
    updated_by: string | null;
    created_at: Date;
    updated_at: Date;
}
