import { IsOptional } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class DiscountQueryDto extends PaginationDto {
    @IsOptional()
    code: string;

    @IsOptional()
    date: string;
}