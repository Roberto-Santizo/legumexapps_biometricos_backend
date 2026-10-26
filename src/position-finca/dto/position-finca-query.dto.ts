import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class PositionFincaQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Filtro por código de la posición (búsqueda parcial)',
        type: String,
        example: 'SUP',
    })
    @IsOptional()
    position_code: string;

    @ApiPropertyOptional({
        description: 'Filtro por nombre de la posición (búsqueda parcial)',
        type: String,
        example: 'Supervisor',
    })
    @IsOptional()
    position_name: string;
}