import { AuthController } from './auth.controller.js';
import { AuthEncryptationService } from './services/auth-encryptation.service.js';
import { AuthService } from './auth.service.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt-strategy.js';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { CommonModule } from '../common/common.module.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthEncryptationService, JwtStrategy],
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: '2h'
          }
        }
      }
    }),

    CommonModule
  ],

  exports: [TypeOrmModule, PassportModule, JwtModule, JwtStrategy, AuthService]
})
export class AuthModule { }
