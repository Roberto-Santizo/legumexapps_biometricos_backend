import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate } from "class-validator";

export class GenerateTransactionsReportDto {
    @ApiProperty({
        description: 'Fecha de inicio del reporte (inclusiva, UTC)',
        type: String,
        format: 'date',
        example: '2026-10-12',
    })
    @IsDate()
    @Type(() => Date)
    start_date: Date;

    @ApiProperty({
        description: 'Fecha de fin del reporte (incluye el día completo, UTC). No puede estar a más de 7 días de start_date',
        type: String,
        format: 'date',
        example: '2026-10-18',
    })
    @IsDate()
    @Type(() => Date)
    end_date: Date;
}
