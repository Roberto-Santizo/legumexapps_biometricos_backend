import { OmitType } from '@nestjs/swagger';
import { CreateEmployeeDto } from './create-employee.dto.js';

// ZKBioAccess requiere el payload completo; el PIN se toma del empleado existente
export class UpdateEmployeeDto extends OmitType(CreateEmployeeDto, ['pin'] as const) {
}
