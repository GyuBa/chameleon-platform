import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from 'typeorm';
import {Common} from './interfaces/Common';
import {User} from './User';
import {Image} from './Image';
import {ModelConfig} from '../types/chameleon-platform';

@Entity()
export class Model extends Common{
    @Column()
        uniqueName: string;
    @Column()
        name: string;
    @Column()
        description: string;

    @ManyToOne(
        () => User
    )
    @JoinColumn()
        register: User;

    @OneToOne(
        type => Image
    )
    @JoinColumn()
        image: Image;

    @Column()
        cacheSize: number;

    @Column()
        inputType: string;

    @Column()
        outputType: string;

    @Column({type: 'json'})
        parameters: any;

    @Column({type: 'json'})
        config: ModelConfig;
}
