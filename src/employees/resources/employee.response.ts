import { ApiProperty } from "@nestjs/swagger";
import { EmployeeList } from "../interfaces/interfaces.js";

export class EmployeeListResponse implements EmployeeList {
    @ApiProperty({
        description: 'ID del empleado (32 caracteres)',
        example: '4028898594b7f9660194b7fb5d7a0500',
    })
    id: string;

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
        description: 'PIN (código) del empleado en ZKBioAccess',
        example: '10045',
    })
    pin: string;

     @ApiProperty({
        description: 'Posición del empleado en ZKBioAccess',
        example: '1PROGRA001',
    })
    position: string;

    @ApiProperty({
        description: 'Nombre del usuario que creó el registro',
        example: 'Juan Pérez López',
    })
    createdBy: string;

    @ApiProperty({
        description: 'Nombre del último usuario que actualizó el registro',
        example: 'Juan Pérez López',
    })
    updatedBy: string;

    @ApiProperty({
        description: 'Nombre del departamento del empleado',
        example: 'Producción',
    })
    department: string;
   
    @ApiProperty({
        description: 'Código del departamento del empleado',
        example: 'Producción',
    })
    departmentCode: string;

    @ApiProperty({
        description: 'Indica si el empleado tiene fotografía',
        example: true,
    })
    hasPhoto: boolean;
    
    @ApiProperty({
        description: 'URL de la fotografía del empleado (cadena vacía si no tiene)',
        example: 'http://localhost:3000/api/employees/photos/10045.jpg',
    })
    photoUrl: string;
}
