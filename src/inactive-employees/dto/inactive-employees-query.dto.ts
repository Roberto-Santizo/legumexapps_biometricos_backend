import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class InactiveEmployeesQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Filtro por nombre del empleado inactivo (búsqueda parcial)',
        type: String,
        example: 'Juan',
    })
    @IsOptional()
    @IsString()
    name?: string;
}
