import { PartialType } from '@nestjs/swagger';
import { RegisterDto } from '../../auth/dto/index.js';

export class UpdateUserDto extends PartialType(RegisterDto) { }
