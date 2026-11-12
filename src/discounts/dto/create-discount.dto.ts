import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsString, Min } from "class-validator";

export class CreateDiscountDto {
    @ApiProperty({
        description: 'Código (pin) del empleado en ZKBioAccess al que se aplica el descuento',
        type: String,
        example: '1001',
    })
    @IsString()
    code: string;

    @ApiProperty({
        description: 'Monto del descuento',
        type: Number,
        minimum: 0.1,
        example: 25.5,
    })
    @IsNumber()
    @Min(0.1)
    amount: number;

    @ApiProperty({
        description: 'Fecha del descuento (ISO 8601)',
        type: String,
        format: 'date',
        example: '2026-11-12',
    })
    @IsDateString()
    date: Date;
}
