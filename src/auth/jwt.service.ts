import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  generateAccessToken(userId: number) {
    return this.jwtService.sign(
      { sub: userId },
      { expiresIn: '15m' },
    );
  }

  generateRefreshToken(userId: number, tokenId: string) {
    return this.jwtService.sign(
      { sub: userId, jti: tokenId },
      { expiresIn: '7d' },
    );
  }

  verifyToken(token: string) {
    return this.jwtService.verify(token);
  }

  decodeToken(token: string) {
    return this.jwtService.decode(token);
  }

  generateTokenId(): string {
    return uuidv4();
  }
}
