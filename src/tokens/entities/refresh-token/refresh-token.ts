import { CoreEntity } from 'src/common/CoreEntity';
import { User } from 'src/user/entities/user/user';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class RefreshToken extends CoreEntity {

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  user: User;
  
  @Column()
  tokenId: string;

  @Column()
  hashedToken: string;

  @Column()
  expiresAt: Date;
}
