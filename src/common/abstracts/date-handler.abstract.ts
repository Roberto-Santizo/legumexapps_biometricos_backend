export abstract class DateHandler {
    abstract getCurrentDate(): Date;
    abstract getCurrentDate(pattern: string): string;
    abstract formatDate(date: Date): string;
}