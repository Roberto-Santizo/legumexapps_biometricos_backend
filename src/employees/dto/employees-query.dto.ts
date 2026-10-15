import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class EmployeesQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Filtro por nombre del empleado (búsqueda parcial)',
        type: String,
        example: 'Juan',
    })
    @IsOptional()
    @IsString()
    name?: string;
}
