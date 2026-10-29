import { IsOptional } from "class-validator";

export class UpdatePositionDto {
    @IsOptional()
    name: string;

    @IsOptional()
    code: string;
}
