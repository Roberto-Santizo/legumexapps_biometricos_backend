import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class DepartmentQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Filtro por nombre del departamento (búsqueda parcial)',
        type: String,
        example: 'recursos',
    })
    @IsOptional()
    dept_name: string;
}