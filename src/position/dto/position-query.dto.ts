import { IsOptional } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class PositionQueryDto extends PaginationDto {
    @IsOptional()
    name: string;

    @IsOptional()
    code: string;
}