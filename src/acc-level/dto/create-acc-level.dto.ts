import { IsString } from "class-validator";

export class CreateAccLevelDto {
    @IsString()
    name: string;
}
