import { IsOptional } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";
import { Type } from "class-transformer";

export class EmployeesFincasQueryDto extends PaginationDto {
    @IsOptional()
    last_name: string;

    @IsOptional()
    first_name: string;

    @IsOptional()
    emp_code: string;
    
    @IsOptional()
    @Type(() => Number)
    position_id: number;
}