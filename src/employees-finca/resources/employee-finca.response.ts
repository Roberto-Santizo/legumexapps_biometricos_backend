import { ApiProperty } from "@nestjs/swagger";
import { AreaFincaInterface } from "../../area-finca/interfaces/index.js";
import { EmployeeFincaDetailInterface, EmployeeFincaListInterface } from "../interfaces/index.js";

export class EmployeeFincaAreaResponse implements AreaFincaInterface {
    @ApiProperty({
        description: 'ID de la asignación área-empleado (usado para desasignar el área)',
        example: 15,
    })
    id: number;

    @ApiProperty({
        description: 'Código del área',
        example: 'A01',
    })
    area_code: string;

    @ApiProperty({
        description: 'Nombre del área',
        example: 'Finca Central',
    })
    area_name: string;
}

export class EmployeeFincaListResponse implements EmployeeFincaListInterface {
    @ApiProperty({
        description: 'ID del empleado',
        example: 125,
    })
    id: number;

    @ApiProperty({
        description: 'Código del empleado',
        example: '1045',
    })
    emp_code: string;

    @ApiProperty({
        description: 'Nombres del empleado',
        example: 'Juan Carlos',
    })
    first_name: string;

    @ApiProperty({
        description: 'Apellidos del empleado',
        example: 'Pérez López',
    })
    last_name: string;

    @ApiProperty({
        description: 'Nombre del departamento del empleado',
        example: 'Producción',
    })
    department: string;

    @ApiProperty({
        description: 'Nombre de la posición del empleado',
        example: 'Operario',
    })
    position: string;

    @ApiProperty({
        description: 'Indica si el empleado está dado de baja',
        example: false,
    })
    resign: boolean;
}

export class EmployeeFincaDetailResponse extends EmployeeFincaListResponse implements EmployeeFincaDetailInterface {
    @ApiProperty({
        description: 'Áreas asignadas al empleado',
        type: [EmployeeFincaAreaResponse],
    })
    areas: EmployeeFincaAreaResponse[];
}
