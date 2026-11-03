import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateEmployeeDto {

    @ApiProperty({
        description: 'Nombre del empleado',
        minLength: 10,
        example: 'Juan Carlos',
    })
    @IsString()
    @MinLength(10)
    name: string;

    @ApiProperty({
        description: 'Apellidos del empleado',
        minLength: 5,
        example: 'Pérez López',
    })
    @IsString()
    @MinLength(5)
    lastName: string;

    @ApiProperty({
        description: 'PIN (código) del empleado en ZKBioAccess; si ya existe, el empleado se actualiza',
        minLength: 5,
        example: '10045',
    })
    @IsString()
    @MinLength(5)
    pin: string;

    @ApiProperty({
        description: 'Código del departamento al que pertenece el empleado',
        example: 'PROD01',
    })
    @IsString()
    deptCode: string;

    @ApiProperty({
        description: 'IDs de los niveles de acceso a asignar, separados por coma',
        minLength: 10,
        example: '4028898594b7f9660194b7fb5d7a0430',
    })
    @IsString()
    accLevelIds: string;

    @ApiPropertyOptional({
        description: 'ID de la posición a asignar; no debe tener otro empleado asignado',
        example: '4028898594b7f9660194b7fb5d7a0600',
    })
    @IsOptional()
    @IsString()
    position_id?: string;

    @ApiPropertyOptional({
        description: 'Fecha y hora de inicio de vigencia del acceso',
        example: '2026-10-15 08:00:00',
    })
    @IsOptional()
    accStartTime?: string;

    @ApiPropertyOptional({
        description: 'Fecha y hora de fin de vigencia del acceso',
        example: '2027-10-15 18:00:00',
    })
    @IsOptional()
    accEndTime?: string;
}
