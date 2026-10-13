import { PartialType } from '@nestjs/swagger';
import { CreateAuthDepartmentDto } from './create-auth-department.dto.js';

export class UpdateAuthDepartmentDto extends PartialType(CreateAuthDepartmentDto) {}
