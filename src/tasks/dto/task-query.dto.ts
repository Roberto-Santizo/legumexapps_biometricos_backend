import { IsDate, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";
import { Type } from "class-transformer";

export class TaskQueryDto extends PaginationDto {
    @IsOptional()
    @IsString()
    pin: string;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    scheduled_at: Date;
}