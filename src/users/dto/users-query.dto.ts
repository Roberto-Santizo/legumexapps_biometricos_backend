import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class UsersQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Filtra por nombre (búsqueda parcial, sin distinguir mayúsculas)',
        example: 'Juan',
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        description: 'Filtra por correo electrónico (búsqueda parcial, sin distinguir mayúsculas)',
        example: 'juan.perez',
    })
    @IsOptional()
    email?: string;
}
