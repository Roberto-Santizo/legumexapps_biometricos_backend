import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class AssignDoorToLevelDto {
    @ApiProperty({
        description: 'ID de la puerta a asignar',
        minLength: 32,
        example: '4028898594b7f9660194b7fb5d7a0432',
    })
    @IsString()
    @MinLength(32)
    door_id: string;
 
    @ApiProperty({
        description: 'ID del nivel de acceso',
        minLength: 32,
        example: '4028898594b7f9660194b7fb5d7a0430',
    })
    @IsString()
    @MinLength(32)
    level_id: string;
}
