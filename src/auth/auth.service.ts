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
    private readonly configService: ConfigService,
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
        // secret: 'dczNQxwmfdlx0mD3fA6hGb5wPj8w9vFthI9Ll6wIrxs=',
        secret: `P1eprtF5+Dw11f/NKTeP4pN8HTyOZTegWptnf6KUtWgefSyOQ6U3fK/HjbmwdMz2
Gs7LJ2LEQKHwk9yMJhEqacGU9d33BAf5qMeVEo3uZCgFPMfcLPZ3hQ0tQGFjh1Sh
rZbbriPxJU8zT4ynlYp8uZB40aciyo4+J9o0IRhPLMH5JkJ5tVPuoIK2jm514GUR
zYTY0ZWpKhUOLzM8jtQdWNLJnNKLnHcr23dfpdxHtGywJBW7zmiRmOAzcPMweCTR
E2DIZTx50IT1dori7KE8GH91Pk0onpXcUxyGIe2+ihq3L0VIgEezn1r/FLEE4OGa
B9Ew8cNIwt5rDlnB167dlw==`,
        expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES_IN') || '15m',
      },
    );

    // RefreshToken
    const refreshTokenExpiresInStr = this.configService.get('REFRESH_TOKEN_EXPIRES_IN') || '7d';
    const refreshTokenExpiresMs = this.parseExpireTimeToMs(refreshTokenExpiresInStr);

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        jti: tokenId,
      },
      {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
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
