import { ApiProperty } from "@nestjs/swagger";
import { DashboardEmployeesInterface, DepartmentCountInterface } from "../interfaces/index.js";

export class DepartmentCountResponse implements DepartmentCountInterface {
    @ApiProperty({ description: 'ID del departamento', example: '4028898594b7f9660194b7fb25b00010' })
    dept_id: string;

    @ApiProperty({ description: 'Código del departamento', example: 'PROD01' })
    code: string;

    @ApiProperty({ description: 'Nombre del departamento', example: 'Producción' })
    name: string;

    @ApiProperty({ description: 'Empleados en el departamento', example: 120 })
    total: number;
}

export class DashboardEmployeesResponse implements DashboardEmployeesInterface {
    @ApiProperty({ description: 'Total de empleados activos', example: 850 })
    total: number;

    @ApiProperty({ description: 'Empleados con posición asignada', example: 820 })
    with_position: number;

    @ApiProperty({ description: 'Empleados sin posición asignada', example: 30 })
    without_position: number;

    @ApiProperty({ description: 'Empleados por departamento (incluye departamentos sin empleados), orden descendente', type: [DepartmentCountResponse] })
    by_department: DepartmentCountResponse[];
}
