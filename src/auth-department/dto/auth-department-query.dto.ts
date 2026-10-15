import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class AuthDepartmentQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Filtro por nombre del departamento (búsqueda parcial)',
        type: String,
        example: 'Producción',
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        description: 'Filtro por código del departamento (búsqueda parcial)',
        type: String,
        example: 'PROD',
    })
    @IsOptional()
    @IsString()
    code?: string;
}
