import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class InactiveEmployeeDto {
    @ApiProperty({
        description: 'PIN (código) del empleado en ZKBioAccess',
        example: '10045',
    })
    @IsString()
    pin: string;

    @ApiPropertyOptional({
        description: 'Tipo de baja en ZKBioAccess',
        type: Number,
        example: 1,
    })
    @IsOptional()
    leaveType: number;

    @ApiPropertyOptional({
        description: 'Fecha de la baja',
        type: Date,
        example: '2026-10-15T14:30:00.000Z',
    })
    @IsOptional()
    leaveDate: Date;

}