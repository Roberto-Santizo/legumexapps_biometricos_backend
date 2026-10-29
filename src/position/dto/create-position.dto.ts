import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreatePositionDto {
    @ApiProperty({
        description: 'Nombre de la posición',
        example: 'Operario de campo',
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Código único de la posición',
        example: 'POS-001',
    })
    @IsString()
    code: string;
}
