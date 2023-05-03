import {Column, Entity} from 'typeorm';
import {Common} from './interfaces/Common';
import {SupportToData} from '../types/chameleon-platform.enum';
import {EntityDataUtils} from '../utils/EntityDataUtils';

@Entity()
export class Region extends Common implements SupportToData {
    @Column()
        name: string;

    @Column()
        host: string;

    @Column()
        port: number;

    @Column()
        cacheSize: number;

    toData() {
        return EntityDataUtils.toData([
            'id',
            'name',
            'host',
            'port',
            'cacheSize'
        ], this);
    }
}
