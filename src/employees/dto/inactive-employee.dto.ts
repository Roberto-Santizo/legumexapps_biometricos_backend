import { IsOptional, IsString } from "class-validator";

export class InactiveEmployeeDto {
    @IsString()
    pin: string;

    @IsOptional()
    leaveType: number;

    @IsOptional()
    leaveDate: Date;

}