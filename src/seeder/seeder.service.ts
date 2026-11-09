import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service.js';

@Injectable()
export class SeederService {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) { }

    async seedDb() {
        const enviroment = this.configService.get<string>('APP_ENV');
        if (enviroment != 'dev') throw new BadRequestException(`Seeder is not available on ${enviroment} env`);

        const username = this.configService.get<string>('ROOT_USER');
        const email = this.configService.get<string>('ROOT_USER_EMAIL');
        const password = this.configService.get<string>('ROOT_USER_PASSWORD');

        if (!username && !email && !password) throw new BadRequestException(`Make sure that the .env has the right values`);

        return await this.authService.register({ name: username!, email: email!, password: password!, roles: ['administrator'], isActive: true });
    }
}
