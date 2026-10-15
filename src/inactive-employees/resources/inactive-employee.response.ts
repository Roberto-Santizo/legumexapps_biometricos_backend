import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { InactiveEmployeeDetailInterface, InactiveEmployeeInterface } from "../interfaces/index.js";

export class InactiveEmployeeResponse implements InactiveEmployeeInterface {
    @ApiProperty({
        description: 'ID del registro de baja del empleado',
        example: '4028898594b7f9660194b7fb5d7a0600',
    })
    id: string;

    @ApiProperty({
        description: 'PIN (código) del empleado en ZKBioAccess',
        example: '10045',
    })
    pin: string;

    @ApiProperty({
        description: 'Nombre del empleado',
        example: 'Juan Carlos',
    })
    name: string;

    @ApiProperty({
        description: 'Apellidos del empleado',
        example: 'Pérez López',
    })
    last_name: string;

    @ApiProperty({
        description: 'Fecha de la baja del empleado',
        type: Date,
        example: '2026-10-15T14:30:00.000Z',
    })
    leave_date: Date;

    @ApiProperty({
        description: 'Nombre del departamento del empleado',
        example: 'Producción',
    })
    department: string;
}

export class InactiveEmployeeDetailResponse extends InactiveEmployeeResponse implements InactiveEmployeeDetailInterface {
    @ApiPropertyOptional({
        description: 'Código del usuario que creó el registro',
        example: 'admin',
    })
    creater_code?: string;

    @ApiPropertyOptional({
        description: 'Nombre del usuario que creó el registro',
        example: 'Juan Pérez López',
    })
    creater_name?: string;

    @ApiPropertyOptional({
        description: 'Código del último usuario que actualizó el registro',
        example: 'admin',
    })
    updater_code?: string;

    @ApiPropertyOptional({
        description: 'Nombre del último usuario que actualizó el registro',
        example: 'Juan Pérez López',
    })
    updater_name?: string;
}
