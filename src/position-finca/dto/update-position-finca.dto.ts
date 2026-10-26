import { PartialType } from '@nestjs/swagger';
import { CreatePositionFincaDto } from './create-position-finca.dto.js';

export class UpdatePositionFincaDto extends PartialType(CreatePositionFincaDto) {}
