import { IsString, MinLength } from "class-validator";

export class CreateEmployeeDto {
    
    @IsString()
    @MinLength(10)
    name: string;
    
    @IsString()
    @MinLength(5)
    last_name: string;
    
    
    @IsString()
    @MinLength(5)
    pin: string;

    @IsString()
    @MinLength(10)
    photo_path: string;
}
