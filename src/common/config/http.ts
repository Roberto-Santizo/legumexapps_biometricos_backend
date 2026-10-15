import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Agent } from 'node:https';
import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type InternalAxiosRequestConfig,
} from 'axios';

@Injectable()
export class Http {
    private readonly axios: AxiosInstance;

    constructor(private readonly configService: ConfigService) {
        // Solo se desactiva la validación del certificado si se indica explícitamente 'false'
        const rejectUnauthorized =
            this.configService.get<string>('ZKBIO_TLS_REJECT_UNAUTHORIZED') !==
            'false';

        this.axios = axios.create({
            baseURL: this.configService.get<string>('ZKBIO_BASE_URL'),
            httpsAgent: new Agent({ rejectUnauthorized }),
        });

        this.axios.interceptors.request.use((config) =>
            this.attachAccessToken(config),
        );
    }

    private attachAccessToken(
        config: InternalAxiosRequestConfig,
    ): InternalAxiosRequestConfig {
        const accessToken =
            this.configService.getOrThrow<string>('ZKBIO_ACCESS_TOKEN');

        if (config.params instanceof URLSearchParams) {
            config.params.set('access_token', accessToken);
        } else {
            config.params = { ...config.params, access_token: accessToken };
        }

        return config;
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const { data } = await this.axios.get<T>(url, config);
        return data;
    }

    async post<T, D = unknown>(
        url: string,
        body?: D,
        config?: AxiosRequestConfig<D>,
    ): Promise<T> {
        const { data } = await this.axios.post<T>(url, body, config);
        return data;
    }

    async put<T, D = unknown>(
        url: string,
        body?: D,
        config?: AxiosRequestConfig<D>,
    ): Promise<T> {
        const { data } = await this.axios.put<T>(url, body, config);
        return data;
    }

    async patch<T, D = unknown>(
        url: string,
        body?: D,
        config?: AxiosRequestConfig<D>,
    ): Promise<T> {
        const { data } = await this.axios.patch<T>(url, body, config);
        return data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const { data } = await this.axios.delete<T>(url, config);
        return data;
    }
}
