import { DateHandler } from '../abstracts/date-handler.abstract.js';
import { Injectable } from '@nestjs/common';
import { TZDate } from '@date-fns/tz';

@Injectable()
export class DateHandlerService implements DateHandler {
    getCurrentDate(): Date {
        const now = new TZDate(new Date(), 'America/Guatemala');
        return now;
    }
}
