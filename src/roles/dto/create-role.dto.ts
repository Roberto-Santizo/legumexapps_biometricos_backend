import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class CreateRoleDto {
    @ApiProperty({
        description: 'Nombre del rol (se guarda en minúsculas, debe ser único)',
        type: String,
        minLength: 4,
        example: 'administrador',
    })
    @IsString()
    @MinLength(4)
    name: string;
}
