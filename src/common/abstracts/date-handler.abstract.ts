export abstract class DateHandler {
    abstract getCurrentDate(): Date;
    abstract formatDate(date: Date): string;
}