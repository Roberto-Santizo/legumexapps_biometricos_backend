import { ApiProperty } from "@nestjs/swagger";

export class PaginatedResponseDto {
    @ApiProperty({
        description: 'Total de registros que cumplen los filtros',
        example: 125,
    })
    total: number;

    @ApiProperty({
        description: 'Total de páginas según el limit enviado',
        example: 13,
    })
    totalPages: number;

    @ApiProperty({
        description: 'Página actual (calculada como offset / limit + 1)',
        example: 1,
    })
    currentPage: number;
}
