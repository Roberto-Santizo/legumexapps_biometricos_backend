import { PartialType } from '@nestjs/swagger';
import { CreateAreaFincaDto } from './create-area-finca.dto.js';

export class UpdateAreaFincaDto extends PartialType(CreateAreaFincaDto) {}
