import { ApiProperty } from "@nestjs/swagger";
import { AccDoorInterface, AccLevelDoorInterface, AccLevelEmployeeInterface } from "../interfaces/index.js";

export class AccDoorResponse implements AccDoorInterface {
    @ApiProperty({
        description: 'ID de la puerta (32 caracteres)',
        example: '4028898594b7f9660194b7fb5d7a0432',
    })
    id: string;

    @ApiProperty({
        description: 'ID del dispositivo al que pertenece la puerta',
        example: '4028898594b7f9660194b7fb5d7a0433',
    })
    dev_id: string;

    @ApiProperty({
        description: 'Alias del dispositivo',
        example: 'Entrada Planta 1',
    })
    dev_alias: string;
}

export class AccLevelDoorResponse extends AccDoorResponse implements AccLevelDoorInterface {
    @ApiProperty({
        description: 'Nombre del nivel de acceso',
        example: 'Acceso general',
    })
    name: string;
}

export class AccLevelEmployeeResponse implements AccLevelEmployeeInterface {
    @ApiProperty({
        description: 'ID de la asignación nivel-empleado (32 caracteres)',
        example: '4028898594b7f9660194b7fb5d7a0600',
    })
    id: string;

    @ApiProperty({
        description: 'ID del empleado',
        example: '4028898594b7f9660194b7fb5d7a0500',
    })
    pers_person_id: string;

    @ApiProperty({
        description: 'ID del nivel de acceso',
        example: '4028898594b7f9660194b7fb5d7a0430',
    })
    level_id: string;

    @ApiProperty({
        description: 'Nombre del nivel de acceso',
        example: 'Acceso general',
    })
    level_name: string;
}
