import { v4 as uuid } from 'uuid';

export const fileNamer = (req: Express.Request, file: any, callback: Function) => {

    if (!file) return callback(new Error('File is Empty'), false);
    const fileExtension = file.mimetype.split('/')[1];

    const fileName = `${uuid()}.${fileExtension}`;

    callback(null, fileName)
}