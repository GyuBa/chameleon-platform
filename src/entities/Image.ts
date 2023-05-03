import {Column, Entity, ManyToOne} from 'typeorm';
import {Common} from './interfaces/Common';
import {Region} from './Region';
import {SupportToData} from '../types/chameleon-platform.enum';
import {EntityDataUtils} from '../utils/EntityDataUtils';

@Entity()
export class Image extends Common implements SupportToData {
    @Column()
        repository: string;

    @Column()
        tag: string;
    @Column()
        path: string;

    @Column()
        uniqueId: string;

    @ManyToOne(
        () => Region
    )
        region: Region;

    getRepositoryTagString() {
        return `${this.repository}:${this.tag}`;
    }

    toData() {
        return EntityDataUtils.toData([
            'id',
            'repository',
            'tag',
            'path',
            'uniqueId',
            'region',
        ], this);
    }
}
