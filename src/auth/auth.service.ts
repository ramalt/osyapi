import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user/user';
import { UserService } from 'src/user/user.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid ? user : null;
  }

  async generateTokens(user: User) {
    const tokenId = uuidv4();

    // AccessToken
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        // roles: user.roles,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
      },
    );

    // RefreshToken
    const refreshTokenExpiresInStr = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    const refreshTokenExpiresMs = this.parseExpireTimeToMs(refreshTokenExpiresInStr);

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        jti: tokenId,
      },
      {
        // secret: this.configService.get('JWT_SECRET'),
        secret: process.env.JWT_SECRET,
        expiresIn: refreshTokenExpiresInStr,
      },
    );

    return {
      accessToken,
      refreshToken,
      tokenId,
      refreshTokenExpiresIn: refreshTokenExpiresMs,
    };
  }

  async getUserById(id: string) {
    return await this.usersService.findById(id);
  }

  //  '7d', '30m', '15s' → milisaniye 
  private parseExpireTimeToMs(time: string): number {
    const match = time.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error('Invalid time format');

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
  }
}
