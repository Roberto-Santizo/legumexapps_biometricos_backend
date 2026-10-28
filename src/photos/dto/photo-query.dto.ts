import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class PhotoQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Filtra por código de la foto (búsqueda parcial)',
        type: String,
        example: '100',
    })
    @IsOptional()
    @IsString()
    code: string;
}