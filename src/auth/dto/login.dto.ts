import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class LoginDto {
    @ApiProperty({
        description: 'Correo electrónico del usuario',
        format: 'email',
        example: 'juan.perez@legumex.com',
    })
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        example: 'Secreta123',
    })
    @IsString()
    password: string;
}