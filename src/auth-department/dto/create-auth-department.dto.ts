import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class CreateAuthDepartmentDto {
    @ApiProperty({
        description: 'Código único del departamento',
        minLength: 5,
        example: 'PROD01',
    })
    @IsString()
    @MinLength(5)
    code:string;
    
    @ApiProperty({
        description: 'Nombre del departamento',
        minLength: 5,
        example: 'Producción',
    })
    @IsString()
    @MinLength(5)
    name: string;
}
