import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
    @ApiProperty({
        description: 'Nombre completo del usuario',
        minLength: 10,
        example: 'Juan Pérez López',
    })
    @IsString()
    @MinLength(10)
    name: string;

    @ApiProperty({
        description: 'Correo electrónico único del usuario',
        format: 'email',
        example: 'juan.perez@legumex.com',
    })
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        minLength: 6,
        maxLength: 50,
        example: 'Secreta123',
    })
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    password: string;

    @ApiPropertyOptional({
        description: 'Roles del usuario (admin, rrhh, user). Por defecto: ["user"]',
        type: [String],
        example: ['user'],
    })
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    roles: string[];

    @ApiPropertyOptional({
        description: 'Indica si el usuario está activo. Por defecto: true',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive: boolean;
}