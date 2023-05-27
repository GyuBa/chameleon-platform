import {Column, Entity, Unique} from 'typeorm';
import {Common} from './interfaces/Common';

@Entity()
@Unique(['email'])
export class User extends Common {
    @Column()
        email: string;
    @Column()
        password: string;

    @Column()
        username: string;

    @Column({default: 0})
        point: number;

    @Column({default: 0})
        earnedPoint: number;
}
