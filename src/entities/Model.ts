import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from 'typeorm';
import {Common} from './interfaces/Common';
import {User} from './User';
import {Image} from './Image';
import {ModelConfig, ModelInputType, ModelOutputType, ModelParameters} from '../types/chameleon-platform.common';

@Entity()
export class Model extends Common {
    @Column()
        uniqueName: string;
    @Column()
        name: string;
    @Column({type: 'longtext'})
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

    @Column({type: 'enum', enum: ModelInputType})
        inputType: ModelInputType;

    @Column({type: 'enum', enum: ModelOutputType})
        outputType: ModelOutputType;

    @Column({type: 'json'})
        parameters: ModelParameters;

    @Column({type: 'json'})
        config: ModelConfig;

    @Column({nullable: true})
        category: string;

    @Column({default: 0})
        price: number;
}
