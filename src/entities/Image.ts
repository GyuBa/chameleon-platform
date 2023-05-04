import {Column, Entity, ManyToOne} from 'typeorm';
import {Common} from './interfaces/Common';
import {Region} from './Region';

@Entity()
export class Image extends Common {
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
}
