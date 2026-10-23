import { IsOptional } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class DepartmentQueryDto extends PaginationDto {
    @IsOptional()
    dept_name: string;
}