import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseHelpers } from './providers/database-helpers.js';
import { Filters } from './providers/filters.js';
import { IdGeneratorService } from './services/id-generator.service.js';
import { DateHandlerService } from './services/date-handler.service.js';
import { Http } from './config/http.js';
import { EmailService } from './services/email.service.js';
import { HttpFincas } from './config/http-fincas.js';

@Module({
  imports: [ConfigModule],
  providers: [DatabaseHelpers, Filters, IdGeneratorService, DateHandlerService, Http, EmailService, HttpFincas],
  exports: [DatabaseHelpers, Filters, IdGeneratorService, DateHandlerService, Http, EmailService, HttpFincas],
})
export class CommonModule { }
