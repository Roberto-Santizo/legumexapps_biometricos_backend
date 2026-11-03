import { ApiProperty } from "@nestjs/swagger";
import { PermissionTypeEnum, SalaryStatusEnum } from "../entities/permission.entity.js";
import { PermissionEmployeeInterface, PermissionResourceInterface, PermissionSignaturesInterface, PermissionSubstituteInterface } from "../interfaces/index.js";

class PermissionEmployeeResponse implements PermissionEmployeeInterface {
    @ApiProperty({ description: 'PIN (código) del trabajador en ZKBioAccess', example: '11617' })
    pin: string;

    @ApiProperty({ description: 'Nombre del trabajador al momento del permiso', example: 'Juan Pérez López' })
    name: string;

    @ApiProperty({ description: 'Área de trabajo al momento del permiso', example: 'Producción' })
    department: string;

    @ApiProperty({ description: 'Posición de trabajo al momento del permiso', type: String, nullable: true, example: 'Operario' })
    position: string | null;
}

class PermissionSubstituteResponse implements PermissionSubstituteInterface {
    @ApiProperty({ description: 'PIN (código) del comodín en ZKBioAccess', example: '10045' })
    pin: string;

    @ApiProperty({ description: 'Nombre del comodín al momento del permiso', example: 'María García Ruiz' })
    name: string;
}

class PermissionSignaturesResponse implements PermissionSignaturesInterface {
    @ApiProperty({ description: 'Firma del trabajador registrada', example: true })
    employee: boolean;

    @ApiProperty({ description: 'Firma del comodín registrada', example: false })
    substitute: boolean;

    @ApiProperty({ description: 'Firma del jefe o supervisor de línea registrada', example: true })
    supervisor: boolean;

    @ApiProperty({ description: 'Firma del auditor de piso registrada', example: true })
    floor_auditor: boolean;

    @ApiProperty({ description: 'Firma de Vo.Bo. de Recursos Humanos registrada', example: false })
    hr: boolean;
}

export class PermissionResponse implements PermissionResourceInterface {
    @ApiProperty({ description: 'ID del permiso (UUID)', format: 'uuid', example: '3f2b8c1e-6d4a-4b9e-9c1a-2e7f5d8a9b10' })
    id: string;

    @ApiProperty({ description: 'Folio autoincremental del sistema', example: 1 })
    folio: number;

    @ApiProperty({ description: 'Día del permiso (YYYY-MM-DD)', format: 'date', example: '2026-11-03' })
    date: string;

    @ApiProperty({ description: 'Trabajador que solicita el permiso', type: PermissionEmployeeResponse })
    employee: PermissionEmployeeResponse;

    @ApiProperty({ description: 'Comodín que cubre al trabajador (null si no hay)', type: PermissionSubstituteResponse, nullable: true })
    substitute: PermissionSubstituteResponse | null;

    @ApiProperty({ description: 'Tipo de permiso', enum: PermissionTypeEnum, example: PermissionTypeEnum.personal })
    type: PermissionTypeEnum;

    @ApiProperty({ description: 'Motivo de salida', example: 'Cita médica' })
    reason: string;

    @ApiProperty({ description: 'Estado de salario del permiso', enum: SalaryStatusEnum, example: SalaryStatusEnum.paid })
    salary_status: SalaryStatusEnum;

    @ApiProperty({ description: 'Inicio de turno (HH:mm)', example: '06:00' })
    shift_start: string;

    @ApiProperty({ description: 'Fin de turno (HH:mm). Puede ser menor que el inicio si el turno cruza medianoche', example: '14:00' })
    shift_end: string;

    @ApiProperty({ description: 'Firmas registradas en el permiso', type: PermissionSignaturesResponse })
    signatures: PermissionSignaturesResponse;

    @ApiProperty({ description: 'El permiso es válido cuando tiene la firma de RRHH', example: false })
    is_valid: boolean;

    @ApiProperty({ description: 'Nombre del usuario que firmó por RRHH', type: String, nullable: true, example: null })
    hr_signed_by: string | null;

    @ApiProperty({ description: 'Fecha y hora de la firma de RRHH', type: String, format: 'date-time', nullable: true, example: null })
    hr_signed_at: Date | null;

    @ApiProperty({ description: 'Nombre del usuario que creó el permiso', example: 'Juan Pérez López' })
    created_by: string;

    @ApiProperty({ description: 'Nombre del último usuario que editó el permiso', type: String, nullable: true, example: null })
    updated_by: string | null;

    @ApiProperty({ description: 'Fecha de creación del registro', type: String, format: 'date-time', example: '2026-11-03T16:30:00.000Z' })
    created_at: Date;

    @ApiProperty({ description: 'Fecha de última actualización del registro', type: String, format: 'date-time', example: '2026-11-03T16:30:00.000Z' })
    updated_at: Date;
}
