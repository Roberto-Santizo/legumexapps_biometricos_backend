import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module.js';
// import { AuthenticationModule } from '@nestjs/authentication';
import { CommonModule } from './common/common.module.js';
import { RolesModule } from './roles/roles.module.js';

@Module({
  imports: [
    // AuthenticationModule.forRoot(),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true
    }),
    UsersModule,
    CommonModule,
    RolesModule,
  ],
})
export class AppModule { }
