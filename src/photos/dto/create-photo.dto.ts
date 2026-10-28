import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreatePhotoDto {
    @ApiProperty({
        description: 'Código único de la foto (normalmente el PIN del empleado). La imagen se guarda como <code>.jpg',
        type: String,
        example: '10045',
    })
    @IsString()
    code: string;
}
