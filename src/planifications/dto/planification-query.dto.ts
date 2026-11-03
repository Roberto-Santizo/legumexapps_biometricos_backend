import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";
import { Type } from "class-transformer";

export class PlanificationQueryDto extends PaginationDto {
    @ApiPropertyOptional({ description: 'Año ISO de la semana', type: Number, example: 2026 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    year?: number;
}
