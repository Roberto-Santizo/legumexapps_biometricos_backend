import { IsDateString, IsNumber, IsString, Min } from "class-validator";

export class CreateDiscountDto {
    @IsString()
    code: string;

    @IsNumber()
    @Min(0.1)
    amount: number;

    @IsDateString()
    date: Date;
}
