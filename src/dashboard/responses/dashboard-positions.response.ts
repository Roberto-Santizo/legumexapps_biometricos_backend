import { ApiProperty } from "@nestjs/swagger";
import { DashboardPositionsInterface, VacantPositionInterface } from "../interfaces/index.js";

export class VacantPositionResponse implements VacantPositionInterface {
    @ApiProperty({ description: 'ID de la posición', example: '4028898594b7f9660194b7fb5d7a0600' })
    id: string;

    @ApiProperty({ description: 'Código de la posición', example: 'POS-001' })
    code: string;

    @ApiProperty({ description: 'Nombre de la posición', example: 'Operario de campo' })
    name: string;
}

export class DashboardPositionsResponse implements DashboardPositionsInterface {
    @ApiProperty({ description: 'Total de posiciones', example: 900 })
    total: number;

    @ApiProperty({ description: 'Posiciones con empleado asignado', example: 820 })
    occupied: number;

    @ApiProperty({ description: 'Posiciones sin empleado asignado', example: 80 })
    vacant: number;

    @ApiProperty({ description: 'Posiciones vacantes (máximo 50, ordenadas por sort)', type: [VacantPositionResponse] })
    vacant_list: VacantPositionResponse[];
}
