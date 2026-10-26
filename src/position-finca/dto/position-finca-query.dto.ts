import { IsOptional } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class PositionFincaQueryDto extends PaginationDto {
    @IsOptional()
    position_code: string;

    @IsOptional()
    position_name: string;
}