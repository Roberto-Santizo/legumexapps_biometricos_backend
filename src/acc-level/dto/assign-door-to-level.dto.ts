import { IsString, MinLength } from "class-validator";

export class AssignDoorToLevelDto {
    @IsString()
    @MinLength(32)
    door_id: string;
 
    @IsString()
    @MinLength(32)
    level_id: string;
}