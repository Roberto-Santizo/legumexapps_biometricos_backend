import { ApiProperty } from "@nestjs/swagger";
import {
    DailyTransactionsInterface,
    DashboardTransactionsInterface,
    DepartmentTransactionsInterface,
    DeviceTransactionsInterface,
} from "../interfaces/index.js";

export class DailyTransactionsResponse implements DailyTransactionsInterface {
    @ApiProperty({ description: 'Día (yyyy-MM-dd)', example: '2026-10-15' })
    date: string;

    @ApiProperty({ description: 'Marcajes del día', example: 1650 })
    total: number;

    @ApiProperty({ description: 'Empleados distintos que marcaron ese día', example: 790 })
    unique_employees: number;
}

export class DeviceTransactionsResponse implements DeviceTransactionsInterface {
    @ApiProperty({ description: 'Alias del dispositivo', example: 'Entrada Planta 1' })
    dev_alias: string;

    @ApiProperty({ description: 'Marcajes en el dispositivo', example: 5200 })
    total: number;
}

export class DepartmentTransactionsResponse implements DepartmentTransactionsInterface {
    @ApiProperty({ description: 'Nombre del departamento', example: 'Producción' })
    dept_name: string;

    @ApiProperty({ description: 'Marcajes del departamento', example: 3100 })
    total: number;
}

export class DashboardTransactionsResponse implements DashboardTransactionsInterface {
    @ApiProperty({ description: 'Inicio del rango aplicado (yyyy-MM-dd)', example: '2026-10-01' })
    start_date: string;

    @ApiProperty({ description: 'Fin del rango aplicado, inclusivo (yyyy-MM-dd)', example: '2026-10-30' })
    end_date: string;

    @ApiProperty({ description: 'Marcajes en el rango', example: 48000 })
    total: number;

    @ApiProperty({ description: 'Empleados distintos que marcaron en el rango', example: 830 })
    unique_employees: number;

    @ApiProperty({ description: 'Serie diaria (solo días con marcajes), orden ascendente', type: [DailyTransactionsResponse] })
    daily: DailyTransactionsResponse[];

    @ApiProperty({ description: 'Marcajes por dispositivo, orden descendente', type: [DeviceTransactionsResponse] })
    by_device: DeviceTransactionsResponse[];

    @ApiProperty({ description: 'Marcajes por departamento, orden descendente', type: [DepartmentTransactionsResponse] })
    by_department: DepartmentTransactionsResponse[];
}
