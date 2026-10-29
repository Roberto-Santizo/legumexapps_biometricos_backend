import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PositionResourceInterface } from "../interfaces/index.js";

export class PositionResponse implements PositionResourceInterface {
    @ApiProperty({
        description: 'ID de la posición (32 caracteres)',
        example: '4028898594b7f9660194b7fb5d7a0600',
    })
    id: string;

    @ApiProperty({
        description: 'Código único de la posición',
        example: 'POS-001',
    })
    code: string;

    @ApiProperty({
        description: 'Nombre de la posición',
        example: 'Operario de campo',
    })
    name: string;

    @ApiProperty({
        description: 'Nombre del usuario que creó el registro',
        example: 'Juan Pérez López',
    })
    createdBy: string;

    @ApiPropertyOptional({
        description: 'Nombre del último usuario que actualizó el registro',
        example: 'Juan Pérez López',
        nullable: true,
    })
    updatedBy?: string;

    @ApiProperty({
        description: 'Nombre del empleado asignado, o "Sin empleado asociado" si no tiene',
        example: 'Carlos Gómez Ruiz',
    })
    employee?: string;
}
