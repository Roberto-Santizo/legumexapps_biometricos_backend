import { IsOptional } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class EmployeesFincasQueryDto extends PaginationDto {
    @IsOptional()
    last_name: string;
    @IsOptional()
    first_name: string;
}