import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class AccLevelQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Filtro por nombre del nivel (búsqueda parcial)',
        type: String,
        example: 'general',
    })
    @IsString()
    @IsOptional()
    name: string;
}
