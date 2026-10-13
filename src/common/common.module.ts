import { Module } from '@nestjs/common';
import { DatabaseHelpers } from './providers/database-helpers.js';
import { Filters } from './providers/filters.js';
import { IdGeneratorService } from './services/id-generator.service.js';

@Module({
  providers: [DatabaseHelpers, Filters, IdGeneratorService],
  exports: [DatabaseHelpers, Filters, IdGeneratorService],
})
export class CommonModule { }
