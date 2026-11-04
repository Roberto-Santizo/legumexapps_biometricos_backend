import { ApiProperty } from "@nestjs/swagger";

// Solo documenta el cuerpo multipart; el archivo llega por FileInterceptor('signature')
export class HrSignatureDto {
    @ApiProperty({ description: 'Firma de Vo.Bo. de Recursos Humanos (PNG, máx. 1 MB)', type: 'string', format: 'binary' })
    signature: any;
}
