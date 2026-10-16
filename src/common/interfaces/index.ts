export interface FileInterface {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: {
        type: string;
        data: Array<number>
    }
}