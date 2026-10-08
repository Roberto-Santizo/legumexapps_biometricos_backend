import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    
    @IsOptional()
    @IsPositive()
    @Type(() => Number) //enaableImplicitConvertion
    limit?: number;

    @IsOptional()
    @Type(() => Number) //enaableImplicitConvertion
    @Min(0)
    offset?: number;
}