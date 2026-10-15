import { ConfigService } from '@nestjs/config';
import { Email } from '../abstracts/email.abstract.js';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import axios, { isAxiosError } from 'axios';

interface GraphTokenResponse {
    access_token: string;
    expires_in: number;
}

const GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';
const GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
const TOKEN_EXPIRY_MARGIN_MS = 60_000;

@Injectable()
export class EmailService implements Email {
    private readonly logger = new Logger(EmailService.name);
    private accessToken?: string;
    private accessTokenExpiresAt = 0;

    constructor(private readonly configService: ConfigService) { }

    async sendMail(
        subject: string,
        template: string,
        to?: string[],
    ): Promise<string> {
        const sender = this.configService.getOrThrow<string>('MS_GRAPH_SENDER');
        const recipients = to?.length ? to : this.getDefaultRecipients();

        if (!recipients.length)
            throw new InternalServerErrorException(
                'No hay destinatarios configurados para el correo',
            );

        try {
            const token = await this.getAccessToken();
            await axios.post(
                `${GRAPH_BASE_URL}/users/${encodeURIComponent(sender)}/sendMail`,
                {
                    message: {
                        subject,
                        body: { contentType: 'HTML', content: template },
                        toRecipients: recipients.map((address) => ({
                            emailAddress: { address },
                        })),
                    },
                    saveToSentItems: true,
                },
                { headers: { Authorization: `Bearer ${token}` } },
            );

            return 'Correo enviado correctamente.';
        } catch (error) {
            this.logger.error(
                `Error al enviar correo "${subject}"`,
                isAxiosError(error)
                    ? JSON.stringify(error.response?.data ?? error.message)
                    : error,
            );
            throw new InternalServerErrorException(
                'No se pudo enviar el correo',
            );
        }
    }

    private getDefaultRecipients(): string[] {
        return (this.configService.get<string>('MS_GRAPH_RECIPIENTS') ?? '')
            .split(',')
            .map((address) => address.trim())
            .filter(Boolean);
    }

    private async getAccessToken(): Promise<string> {
        if (
            this.accessToken &&
            Date.now() < this.accessTokenExpiresAt - TOKEN_EXPIRY_MARGIN_MS
        )
            return this.accessToken;

        const tenantId = this.configService.getOrThrow<string>('MS_GRAPH_TENANT_ID');

        const { data } = await axios.post<GraphTokenResponse>(
            `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
            new URLSearchParams({
                client_id: this.configService.getOrThrow<string>('MS_GRAPH_CLIENT_ID'),
                client_secret: this.configService.getOrThrow<string>(
                    'MS_GRAPH_CLIENT_SECRET',
                ),
                scope: GRAPH_SCOPE,
                grant_type: 'client_credentials',
            }),
        );

        this.accessToken = data.access_token;
        this.accessTokenExpiresAt = Date.now() + data.expires_in * 1000;

        return this.accessToken;
    }
}
