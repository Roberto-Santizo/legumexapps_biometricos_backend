import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permission.dto.js';

// Sin employee_pin ni substitute_pin: enviarlos devuelve 400 (forbidNonWhitelisted)
export class UpdatePermissionDto extends PartialType(OmitType(CreatePermissionDto, ['employee_pin', 'substitute_pin'] as const)) { }
