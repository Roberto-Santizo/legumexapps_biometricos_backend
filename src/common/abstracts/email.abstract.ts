export abstract class Email {
    abstract sendMail(subject: string, template: string, to?: string[]): Promise<string>;
}
