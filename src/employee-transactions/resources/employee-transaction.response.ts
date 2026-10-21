import { ApiProperty } from "@nestjs/swagger";
import { EmployeeTransactionResourceInterface } from "../interfaces/index.js";

export class EmployeeTransactionResponse implements EmployeeTransactionResourceInterface {
    @ApiProperty({
        description: 'ID de la transacción',
        example: '4028898594b7f9660194b7fb5d7a0700',
    })
    id: string;

    @ApiProperty({
        description: 'Código del departamento del empleado',
        example: '1',
    })
    dept_code: string;

    @ApiProperty({
        description: 'Nombre del departamento del empleado',
        example: 'Producción',
    })
    dept_name: string;

    @ApiProperty({
        description: 'Alias del dispositivo donde se registró la transacción',
        example: 'Entrada Planta 1',
    })
    dev_alias: string;

    @ApiProperty({
        description: 'Fecha y hora del evento (formateada)',
        example: '15-10-2026 14:30:00',
    })
    event_time: string;

    @ApiProperty({
        description: 'Apellidos del empleado',
        example: 'Pérez López',
    })
    last_name: string;

    @ApiProperty({
        description: 'Nombre del empleado',
        example: 'Juan Carlos',
    })
    name: string;

    @ApiProperty({
        description: 'PIN (código) del empleado en ZKBioAccess',
        example: '10045',
    })
    pin: string;
}
