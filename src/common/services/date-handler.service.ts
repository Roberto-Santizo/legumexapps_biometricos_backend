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

    getCurrentDate(): Date;
    getCurrentDate(pattern: string): string;
    getCurrentDate(pattern?: string): Date | string {
        const now = new TZDate(new Date(), TIME_ZONE);
        return pattern ? format(now, pattern) : now;
    }
}
