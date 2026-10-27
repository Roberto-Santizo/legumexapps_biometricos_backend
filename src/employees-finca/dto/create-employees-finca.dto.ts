import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsInt, IsString, Min, MinLength } from "class-validator";

export class CreateEmployeesFincaDto {
    @ApiProperty({
        description: 'Nombres del empleado',
        type: String,
        minLength: 5,
        example: 'Juan Carlos',
    })
    @IsString()
    @MinLength(5)
    first_name: string;

    @ApiProperty({
        description: 'Apellidos del empleado',
        type: String,
        minLength: 5,
        example: 'Pérez López',
    })
    @IsString()
    @MinLength(5)
    last_name: string;

    @ApiProperty({
        description: 'ID del departamento al que pertenece el empleado',
        type: Number,
        minimum: 1,
        example: 2,
    })
    @IsInt()
    @Min(1)
    department: number;

    @ApiProperty({
        description: 'ID de la posición del empleado',
        type: Number,
        minimum: 1,
        example: 4,
    })
    @IsInt()
    @Min(1)
    position: number;

    @ApiProperty({
        description: 'IDs de las áreas asignadas al empleado',
        type: [Number],
        example: [1, 3],
    })
    @IsInt()
    area: number;
}
