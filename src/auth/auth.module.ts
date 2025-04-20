import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokensModule } from 'src/tokens/tokens.module';

@Module({
  imports: [
    JwtModule.register({}),
    ConfigModule,
    UserModule,
    TokensModule
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule { }
