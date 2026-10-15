import { PartialType } from '@nestjs/swagger';
import { CreateInactiveEmployeeDto } from './create-inactive-employee.dto.js';

export class UpdateInactiveEmployeeDto extends PartialType(CreateInactiveEmployeeDto) {}
