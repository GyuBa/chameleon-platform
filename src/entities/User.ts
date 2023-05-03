import {Column, Entity, Unique} from 'typeorm';
import {Common} from './interfaces/Common';
import {SupportToData} from '../types/chameleon-platform.enum';
import {EntityDataUtils} from '../utils/EntityDataUtils';

@Entity()
@Unique(['email'])
export class User extends Common implements SupportToData {
    @Column()
        email: string;

    @Column()
        password: string;

    @Column()
        username: string;

    toData() {
        return EntityDataUtils.toData([
            'id',
            'email',
            'username',
        ], this);
    }
}
