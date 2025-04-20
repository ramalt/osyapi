import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TokensModule } from './tokens/tokens.module';
import { UserModule } from './user/user.module';

import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import * as Joi from 'joi';
import { AppDataSource } from './data/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        ACCESS_TOKEN_EXPIRES_IN: Joi.string().required(),
        REFRESH_TOKEN_EXPIRES_IN: Joi.string().required(),
      }),
    }),

    TypeOrmModule.forRoot(AppDataSource.options),
    AuthModule,
    TokensModule,
    UserModule,
  ],
  providers: [AppService],
})
export class AppModule { }