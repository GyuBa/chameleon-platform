import {Column, Entity, ManyToOne, OneToOne, Unique} from 'typeorm';
import {Common} from './interfaces/Common';
import {Region} from './Region';
import {Model} from './Model';

// ubuntu:latest
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

    @OneToOne(
        () => Model,
        (model) => model.image
    )
        model: Model;

}

// docker - image