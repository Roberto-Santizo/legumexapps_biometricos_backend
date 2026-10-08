import { IsEmail, IsInt, IsNotEmpty, IsPositive, IsString, Min, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @MinLength(5)
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    // @IsInt()
    // @IsPositive()
    // @Min(1)
    // role_id: number;
}
