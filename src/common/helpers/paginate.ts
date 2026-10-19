import { PaginatedResponse } from '../interfaces/index.js';

export const paginate = <T>(data: T[], total: number, limit: number, offset: number): PaginatedResponse<T> => {
    return {
        data,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
    };
}
