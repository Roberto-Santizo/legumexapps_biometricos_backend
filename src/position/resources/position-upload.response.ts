import { ApiProperty } from "@nestjs/swagger";
import { PositionResponse } from "./position.response.js";
import { PositionUploadResult } from "../interfaces/index.js";

export class PositionUploadResponse implements PositionUploadResult {
    @ApiProperty({
        description: 'Mensaje con la cantidad de posiciones creadas',
        example: '25 posiciones creadas correctamente',
    })
    message: string;

    @ApiProperty({
        description: 'Posiciones creadas',
        type: [PositionResponse],
    })
    data: PositionResponse[];
}
