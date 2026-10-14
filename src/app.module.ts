import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { CommonModule } from './common/common.module.js';
import { UsersModule } from './users/users.module.js';
import { EmployeesModule } from './employees/employees.module.js';
import { MSSQL_CONNECTION } from './common/constants/connections.js';
import { AuthDepartmentModule } from './auth-department/auth-department.module.js';
import { AccLevelModule } from './acc-level/acc-level.module.js';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: process.env.APP_ENV == 'dev' ? true : false,
    }),
    TypeOrmModule.forRoot({
      name: MSSQL_CONNECTION,
      type: 'mssql',
      host: process.env.MSSQL_HOST,
      port: +(process.env.MSSQL_PORT ?? 1433),
      database: process.env.MSSQL_NAME,
      username: process.env.MSSQL_USERNAME,
      password: process.env.MSSQL_PASSWORD,
      autoLoadEntities: true,
      synchronize: false,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    }),
    CommonModule,
    AuthModule,
    UsersModule,
    EmployeesModule,
    AuthDepartmentModule,
    AccLevelModule,
  ],
})
export class AppModule { }
