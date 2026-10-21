import { DateHandler } from '../abstracts/date-handler.abstract.js';
import { Injectable } from '@nestjs/common';
import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

const TIME_ZONE = 'America/Guatemala';

@Injectable()
export class DateHandlerService implements DateHandler {
    formatDate(date: Date): string {
        return format(new TZDate(date, TIME_ZONE), 'dd-MM-yyyy HH:mm:ss');
    }

    getCurrentDate(): Date {
        const now = new TZDate(new Date(), TIME_ZONE);
        return now;
    }
}
