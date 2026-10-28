import { AccLevelModule } from './acc-level/acc-level.module.js';
import { AuthDepartmentModule } from './auth-department/auth-department.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CommonModule } from './common/common.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createStorageOptions } from './common/config/storage.config.js';
import { EmployeesModule } from './employees/employees.module.js';
import { InactiveEmployeesModule } from './inactive-employees/inactive-employees.module.js';
import { Module } from '@nestjs/common';
import { MSSQL_CONNECTION, MSSQL_FINCAS_CONNECTION } from './common/constants/connections.js';
import { StorageModule } from '@nestjs/storage';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { EmployeeTransactionsModule } from './employee-transactions/employee-transactions.module.js';
import storage from './common/config/storage.js';
import { ScheduleModule } from '@nestjs/schedule';
import { PhotosModule } from './photos/photos.module.js';
import { EmployeesFincaModule } from './employees-finca/employees-finca.module.js';
import { DepartmentsModule } from './departments/departments.module.js';
import { BiometricsModule } from './biometrics/biometrics.module.js';
import { PositionFincaModule } from './position-finca/position-finca.module.js';
import { AreaFincaModule } from './area-finca/area-finca.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [storage] }),
    ScheduleModule.forRoot(),
    StorageModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createStorageOptions
    }),
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
    TypeOrmModule.forRoot({
      name: MSSQL_FINCAS_CONNECTION,
      type: 'mssql',
      host: process.env.MSSQL_FINCAS_HOST,
      port: +(process.env.MSSQL_FINCAS_PORT ?? 1433),
      database: process.env.MSSQL_FINCAS_NAME,
      username: process.env.MSSQL_FINCAS_USERNAME,
      password: process.env.MSSQL_FINCAS_PASSWORD,
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
    InactiveEmployeesModule,
    TasksModule,
    EmployeeTransactionsModule,
    PhotosModule,
    EmployeesFincaModule,
    DepartmentsModule,
    BiometricsModule,
    PositionFincaModule,
    AreaFincaModule,
  ],
})
export class AppModule { }
