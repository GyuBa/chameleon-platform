import {Column, Entity, JoinColumn, OneToOne} from 'typeorm';
import {Common} from './interfaces/Common';
import {User} from './User';
import {SupportToData} from '../types/chameleon-platform.enum';
import {EntityDataUtils} from '../utils/EntityDataUtils';

@Entity()
export class Wallet extends Common implements SupportToData {
    @Column({default: 0})
        point: number;

    @OneToOne(() => User)
    @JoinColumn({name: 'userId', referencedColumnName: 'id'})
        user: User;

    toData() {
        return EntityDataUtils.toData([
            'id',
            'point',
            'user',
        ], this);
    }
}
