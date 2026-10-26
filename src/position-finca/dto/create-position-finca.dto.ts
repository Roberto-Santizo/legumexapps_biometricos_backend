import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreatePositionFincaDto {
    @ApiProperty({
        description: 'Código único de la posición',
        example: 'SUP-01',
    })
    @IsString()
    position_code: string;

    @ApiProperty({
        description: 'Nombre de la posición',
        example: 'Supervisor de campo',
    })
    @IsString()
    position_name: string;
}
