import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class EmployeeTransactionQueryDto extends PaginationDto {
    @IsOptional()
    @IsString()
    event_time: string;

    @IsOptional()
    @IsString()
    dept_code: string;
    
    @IsOptional()
    @IsString()
    dept_name: string;
    
    @IsOptional()
    @IsString()
    last_name: string;
    
    @IsOptional()
    @IsString()
    name: string;
    
    @IsOptional()
    @IsString()
    pin: string;
}