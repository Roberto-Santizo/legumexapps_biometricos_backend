import { PartialType } from '@nestjs/swagger';
import { CreateEmployeesFincaDto } from './create-employees-finca.dto.js';

export class UpdateEmployeesFincaDto extends PartialType(CreateEmployeesFincaDto) {}
