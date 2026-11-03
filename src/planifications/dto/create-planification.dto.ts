import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Max, Min } from "class-validator";

export class CreatePlanificationDto {
    @ApiProperty({ description: 'Año ISO de la semana', minimum: 2000, example: 2026 })
    @IsInt()
    @Min(2000)
    year: number;

    @ApiProperty({ description: 'Semana ISO (1–53), validada contra el año ISO', minimum: 1, maximum: 53, example: 45 })
    @IsInt()
    @Min(1)
    @Max(53)
    week: number;
}
