import { ApiProperty } from "@nestjs/swagger";
import { IsInt } from "class-validator";

export class AddAreaEmployeeDto {
    @ApiProperty({
        description: 'ID del empleado de fincas al que se asignará el área',
        type: Number,
        example: 125,
    })
    @IsInt()
    employee_id: number;

    @ApiProperty({
        description: 'ID del área de fincas a asignar',
        type: Number,
        example: 3,
    })
    @IsInt()
    area_id: number;
}