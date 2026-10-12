import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class EmployeesQueryDto extends PaginationDto {
    @IsOptional()
    @IsString()
    name?: string;
}