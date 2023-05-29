import {Column, Entity} from 'typeorm';
import {Common} from './interfaces/Common';

@Entity()
export class Region extends Common {
    @Column()
        name: string;

    @Column()
        host: string;

    @Column()
        port: number;

    @Column({default: false})
        useGPU: boolean;

    @Column()
        cacheSize: number;
}
