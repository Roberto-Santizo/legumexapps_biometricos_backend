import { IsString, MinLength } from "class-validator";

export class CreateRoleDto {
    @IsString()
    @MinLength(4)
    name: string;
}
