import { IsDate, IsOptional, IsString, MinLength } from "class-validator";

export class CreateEmployeeDto {

    @IsString()
    @MinLength(10)
    name: string;

    @IsString()
    @MinLength(5)
    lastName: string;

    @IsString()
    @MinLength(5)
    pin: string;

    @IsString()
    deptCode: string;

    @IsString()
    @MinLength(10)
    accLevelIds: string;

    @IsString()
    @IsOptional()
    accStartTime: string;

    @IsString()
    @IsOptional()
    accEndTime: string;
}
