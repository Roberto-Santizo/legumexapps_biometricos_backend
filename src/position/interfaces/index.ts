export interface PositionResourceInterface {
    id: string;
    code: string;
    name: string;
    createdBy: string;
    updatedBy?: string;
    employee?: string;
}
export interface PositionRow {
    rowNumber: number;
    code: string;
    name: string;
}

export interface PositionUploadResult {
    message: string;
    data: PositionResourceInterface[];
}
