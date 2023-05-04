import {Column, Entity, JoinColumn, OneToOne} from 'typeorm';
import {Common} from './interfaces/Common';
import {User} from './User';

@Entity()
export class Wallet extends Common {
    @Column({default: 0})
        point: number;

    @OneToOne(() => User)
    @JoinColumn({name: 'userId', referencedColumnName: 'id'})
        user: User;
}
