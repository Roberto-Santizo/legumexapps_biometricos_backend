import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseHelpers } from './providers/database-helpers.js';
import { Filters } from './providers/filters.js';
import { IdGeneratorService } from './services/id-generator.service.js';
import { DateHandlerService } from './services/date-handler.service.js';
import { Http } from './config/http.js';

@Module({
  imports: [ConfigModule],
  providers: [DatabaseHelpers, Filters, IdGeneratorService, DateHandlerService, Http],
  exports: [DatabaseHelpers, Filters, IdGeneratorService, DateHandlerService, Http],
})
export class CommonModule { }
