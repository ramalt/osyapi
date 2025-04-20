import { CoreEntity } from "src/common/CoreEntity";
import { RefreshToken } from "src/tokens/entities/refresh-token/refresh-token";
import { Column, Entity, OneToMany } from "typeorm";

@Entity()
export class User extends CoreEntity {

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
    refreshTokens: RefreshToken[];

}
