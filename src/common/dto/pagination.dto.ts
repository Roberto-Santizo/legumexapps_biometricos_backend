import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    
    @ApiPropertyOptional({
        description: 'Cantidad máxima de registros a devolver',
        type: Number,
        minimum: 1,
        default: 10,
        example: 10,
    })
    @IsOptional()
    @IsPositive()
    @Type(() => Number) //enaableImplicitConvertion
    limit?: number;

    @ApiPropertyOptional({
        description: 'Cantidad de registros a omitir',
        type: Number,
        minimum: 0,
        default: 0,
        example: 0,
    })
    @IsOptional()
    @Type(() => Number) //enaableImplicitConvertion
    @Min(0)
    offset?: number;
}
