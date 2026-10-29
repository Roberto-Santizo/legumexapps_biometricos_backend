import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UpdatePositionDto {
    @ApiPropertyOptional({
        description: 'Nuevo nombre de la posición',
        type: String,
        example: 'Operario de campo',
    })
    @IsOptional()
    name: string;

    @ApiPropertyOptional({
        description: 'Nuevo código de la posición',
        type: String,
        example: 'POS-001',
    })
    @IsOptional()
    code: string;
}
