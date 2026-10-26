import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateDepartmentDto {
    @ApiProperty({
        description: 'Nombre del departamento',
        type: String,
        example: 'Recursos Humanos',
    })
    @IsString()
    dept_name: string;

    @ApiProperty({
        description: 'Código único del departamento',
        type: String,
        example: 'RRHH',
    })
    @IsString()
    dept_code: string;
}
