import { IsString } from "class-validator";

export class CreatePositionFincaDto {
    @IsString()
    position_code: string;
    
    @IsString()
    position_name: string;
}
