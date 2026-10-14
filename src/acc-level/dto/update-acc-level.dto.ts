import { PartialType } from '@nestjs/swagger';
import { CreateAccLevelDto } from './create-acc-level.dto.js';

export class UpdateAccLevelDto extends PartialType(CreateAccLevelDto) {}
