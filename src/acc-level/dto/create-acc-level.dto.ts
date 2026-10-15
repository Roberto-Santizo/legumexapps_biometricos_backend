import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateAccLevelDto {
    @ApiProperty({
        description: 'Nombre del nivel de acceso',
        example: 'Acceso general',
    })
    @IsString()
    name: string;
}
