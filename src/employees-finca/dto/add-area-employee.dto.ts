import { IsInt } from "class-validator";

export class AddAreaEmployeeDto {
    @IsInt()
    employee_id: number;

    @IsInt()
    area_id: number;
}