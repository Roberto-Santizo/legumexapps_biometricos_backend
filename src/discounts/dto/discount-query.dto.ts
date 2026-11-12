import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class DiscountQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Filtra por código (pin) del empleado (búsqueda parcial)',
        type: String,
        example: '1001',
    })
    @IsOptional()
    code: string;

    @ApiPropertyOptional({
        description: 'Filtra por fecha del descuento. Acepta `YYYY-MM-DD`, un rango `desde,hasta` o una fecha ISO',
        type: String,
        example: '2026-11-01,2026-11-12',
    })
    @IsOptional()
    date: string;
}