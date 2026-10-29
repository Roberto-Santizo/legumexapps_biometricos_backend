import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsOptional } from "class-validator";

export class DashboardQueryDto {
    @ApiPropertyOptional({
        description: 'Fecha de inicio del rango (inclusiva, UTC). Por defecto: 29 días antes de end_date',
        type: String,
        format: 'date',
        example: '2026-10-01',
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    start_date?: Date;

    @ApiPropertyOptional({
        description: 'Fecha de fin del rango (incluye el día completo, UTC). Por defecto: hoy. El rango no puede superar 366 días',
        type: String,
        format: 'date',
        example: '2026-10-30',
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    end_date?: Date;
}
