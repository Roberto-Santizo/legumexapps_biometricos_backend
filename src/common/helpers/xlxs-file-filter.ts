export const xlxsFileFilter = (req: Express.Request, file: any, callback: Function) => {
    if (!file) return callback(new Error('File is Empty'), false);
    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

    if (validExtensions.includes(fileExtension)) {
        return callback(null, true);
    } else {
        callback(null, false);
    }
}