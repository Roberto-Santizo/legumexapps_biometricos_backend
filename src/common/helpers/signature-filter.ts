import { BadRequestException } from '@nestjs/common';

export const signatureFilter = (req: Express.Request, file: any, callback: Function) => {
    if (!file) return callback(new BadRequestException('File is Empty'), false);

    if (file.mimetype === 'image/png') {
        return callback(null, true);
    } else {
        callback(new BadRequestException(`La firma '${file.fieldname}' debe ser una imagen PNG`), false);
    }
}
