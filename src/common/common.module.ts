import { Module } from '@nestjs/common';
import { DatabaseHelpers } from './providers/database-helpers.js';
import { Filters } from './providers/filters.js';
import { IdGeneratorService } from './services/id-generator.service.js';
import { DateHandlerService } from './services/date-handler.service.js';

@Module({
  providers: [DatabaseHelpers, Filters, IdGeneratorService, DateHandlerService],
  exports: [DatabaseHelpers, Filters, IdGeneratorService, DateHandlerService],
})
export class CommonModule { }
