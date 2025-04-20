import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token/refresh-token';
import { TokensService } from './tokens.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([RefreshToken]), // işte burası çok mühim
      ],
      providers: [TokensService],
      exports: [TokensService],
})
export class TokensModule { }
