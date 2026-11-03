import { Permission } from "../entities/permission.entity.js";
import { PermissionResourceInterface } from "../interfaces/index.js";

export class PermissionResource {
    static collection(permissions: Permission[]) {
        return permissions.map(permission => this.permissionResource(permission));
    }

    static permissionResource(permission: Permission): PermissionResourceInterface {
        return {
            id: permission.id,
            folio: permission.folio,
            date: permission.date,
            employee: {
                pin: permission.employee_pin,
                name: permission.employee_name,
                department: permission.department_name,
                position: permission.position_name,
            },
            substitute: permission.substitute_pin
                ? { pin: permission.substitute_pin, name: permission.substitute_name ?? '' }
                : null,
            type: permission.type,
            reason: permission.reason,
            salary_status: permission.salary_status,
            // Postgres devuelve 'HH:mm:ss'; se expone 'HH:mm'
            shift_start: permission.shift_start.slice(0, 5),
            shift_end: permission.shift_end.slice(0, 5),
            signatures: {
                employee: !!permission.employee_signature_key,
                substitute: !!permission.substitute_signature_key,
                supervisor: !!permission.supervisor_signature_key,
                floor_auditor: !!permission.floor_auditor_signature_key,
                hr: !!permission.hr_signature_key,
            },
            is_valid: permission.hr_signed_at !== null,
            hr_signed_by: permission.hr_signed_by?.name ?? null,
            hr_signed_at: permission.hr_signed_at,
            created_by: permission.created_by.name,
            updated_by: permission.updated_by?.name ?? null,
            created_at: permission.created_at,
            updated_at: permission.updated_at,
        }
    }
}
