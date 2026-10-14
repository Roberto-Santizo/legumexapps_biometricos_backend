import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class AccLevelQueryDto extends PaginationDto {
    @IsString()
    @IsOptional()
    name: string;
}