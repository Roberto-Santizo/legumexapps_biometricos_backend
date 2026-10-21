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

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    totalPages: number;
    currentPage: number;
}
