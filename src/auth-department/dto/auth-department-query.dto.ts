import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class AuthDepartmentQueryDto extends PaginationDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    code?: string;
}