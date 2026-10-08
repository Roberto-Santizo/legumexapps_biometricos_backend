import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsNotEmpty, IsPositive, IsString, Min, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty({
        description: 'Nombre completo del usuario',
        type: String,
        minLength: 5,
        example: 'Juan Pérez',
    })
    @IsString()
    @MinLength(5)
    name: string;

    @ApiProperty({
        description: 'Correo electrónico único del usuario',
        type: String,
        format: 'email',
        example: 'juan.perez@legumex.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        type: String,
        format: 'password',
        minLength: 1,
        example: 'Secreta123',
    })
    @IsString()
    @IsNotEmpty()
    password: string;

    // @IsInt()
    // @IsPositive()
    // @Min(1)
    // role_id: number;
}
