import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { RefreshToken } from './entities/refresh-token/refresh-token';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class TokensService {
    constructor(
        @InjectRepository(RefreshToken)
        private readonly repo: Repository<RefreshToken>,
    ) { }

    async saveRefreshToken(
        userId: string,
        tokenId: string,
        refreshToken: string,
        expiresInMs: number,
    ): Promise<void> {
        const hashed = await bcrypt.hash(refreshToken, 10);
        const token = this.repo.create({
            userId,
            tokenId,
            hashedToken: hashed,
            expiresAt: new Date(Date.now() + expiresInMs),
        });

        await this.repo.save(token);
    }

    async deleteToken(tokenId: string): Promise<void> {
        await this.repo.softDelete({ tokenId });
    }

    async validateRefreshToken(
        tokenId: string,
        refreshToken: string,
    ): Promise<boolean> {
        const record = await this.repo.findOneBy({ tokenId });

        if (!record || record.expiresAt < new Date()) return false;

        return await bcrypt.compare(refreshToken, record.hashedToken);
    }

    async deleteAllTokensForUser(userId: string): Promise<void> {
        await this.repo.delete({ userId });
    }
}
