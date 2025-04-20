import {
    Controller,
    Post,
    Body,
    Res,
    Req,
    Get,
    HttpCode,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { TokensService } from 'src/tokens/tokens.service';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly tokensService: TokensService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) { }

    @Post('login')
    @HttpCode(200)
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const { accessToken, refreshToken, tokenId, refreshTokenExpiresIn } =
            await this.authService.generateTokens(user);


        await this.tokensService.saveRefreshToken(
            user.id,
            tokenId,
            refreshToken,
            refreshTokenExpiresIn,
        );

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: refreshTokenExpiresIn,
        });

        return res.json({ accessToken });
    }

    @Get('refresh')
    async refresh(@Req() req: Request, @Res() res: Response) {
        const token = req.cookies['refresh_token'];
        if (!token) return res.status(401).json({ message: 'Refresh token missing' });

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.config.get('REFRESH_TOKEN_SECRET'),
                // secret: "SECRET",
            });

            const isValid = await this.tokensService.validateRefreshToken(payload.jti, token);
            if (!isValid) return res.status(403).json({ message: 'Invalid refresh token' });

            const user = await this.authService.getUserById(payload.sub);

            await this.tokensService.deleteToken(payload.jti);

            const { accessToken, refreshToken: newRefresh, tokenId: newJti, refreshTokenExpiresIn } =
                await this.authService.generateTokens(user);

            await this.tokensService.saveRefreshToken(
                user.id,
                newJti,
                newRefresh,
                refreshTokenExpiresIn,
            );

            res.cookie('refresh_token', newRefresh, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: refreshTokenExpiresIn,
            });

            return res.json({ accessToken });
        } catch (e) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
    }

    @Post('logout')
    @HttpCode(200)
    async logout(@Req() req: Request, @Res() res: Response) {
        const token = req.cookies['refresh_token'];
        if (token) {
            try {
                const payload = await this.jwtService.verifyAsync(token, {
                    secret: this.config.get('REFRESH_TOKEN_SECRET'),
                    // secret: "SECRETT",
                });
                await this.tokensService.deleteToken(payload.jti);
            } catch (e) {
                // Silinemese bile önemli değil
            }
        }

        res.clearCookie('refresh_token');
        return res.json({ message: 'Logged out successfully' });
    }
}
