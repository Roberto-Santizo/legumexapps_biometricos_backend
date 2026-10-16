export const imageFilter = (req: Express.Request, file: any, callback: Function) => {
    if (!file) return callback(new Error('File is Empty'), false);
    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'png', 'jpeg', 'gif'];

    if (validExtensions.includes(fileExtension)) {
        return callback(null, true);
    } else {
        callback(null, false);
    }
}