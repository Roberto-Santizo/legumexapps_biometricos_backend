import { IsDate, IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "../../common/dto/pagination.dto.js";
import { Type } from "class-transformer";

export class TaskQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'PIN (código) del empleado (búsqueda parcial)',
        type: String,
        example: '10045',
    })
    @IsOptional()
    @IsString()
    pin: string;

    @ApiPropertyOptional({
        description: 'Fecha y hora programada (coincidencia exacta)',
        type: String,
        format: 'date-time',
        example: '2026-10-21T14:00:00.000Z',
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    scheduled_at: Date;
}
