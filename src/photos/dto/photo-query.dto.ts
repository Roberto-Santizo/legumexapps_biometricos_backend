import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class PhotoQueryDto extends PaginationDto {
    @IsOptional()
    @IsString()
    code: string;
}