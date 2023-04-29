import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from 'typeorm';
import {Common} from './interfaces/Common';
import {User} from './User';
import {Image} from './Image';
import {ModelConfig, ModelParameters} from '../types/chameleon-platform';

@Entity()
export class Model extends Common {
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
        type => Image,
        image => image.model
    )
    @JoinColumn()
        image: Image;

    @Column()
        cacheSize: number;

    @Column()
        inputType: string;

    @Column()
        outputType: string;

    @Column()
        parameters: string;
    @Column()
        config: string;


    getConfig(): ModelConfig {
        return JSON.parse(this.config);
    }

    setConfig(config: ModelConfig) {
        this.config = JSON.stringify(config);
    }

    getParameters(): ModelParameters {
        return JSON.parse(this.parameters);
    }

    setParameters(parameters: ModelParameters) {
        this.parameters = JSON.stringify(parameters);
    }
}
