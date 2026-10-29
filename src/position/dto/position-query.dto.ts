import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class PositionQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Filtro por nombre de la posición (búsqueda parcial)',
        type: String,
        example: 'Operario',
    })
    @IsOptional()
    name: string;

    @ApiPropertyOptional({
        description: 'Filtro por código de la posición (búsqueda parcial)',
        type: String,
        example: 'POS-001',
    })
    @IsOptional()
    code: string;
}