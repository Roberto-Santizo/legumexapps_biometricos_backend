import { IsString, MinLength } from "class-validator";

export class CreateAuthDepartmentDto {
    @IsString()
    @MinLength(5)
    code:string;
    
    @IsString()
    @MinLength(5)
    name: string;
}
