import { IsArray, IsInt, IsString, Min, MinLength } from "class-validator";

export class CreateEmployeesFincaDto {
    @IsString()
    @MinLength(5)
    first_name: string;

    @IsString()
    @MinLength(5)
    last_name: string;

    @IsInt()
    @Min(1)
    department: number;

    @IsInt()
    @Min(1)
    position: number;

    @IsArray()
    @IsInt({ each: true })
    area: number[];
}
