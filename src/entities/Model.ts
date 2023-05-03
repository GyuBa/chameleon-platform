import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from 'typeorm';
import {Common} from './interfaces/Common';
import {User} from './User';
import {Image} from './Image';
import {ModelConfig} from '../types/chameleon-platform';
import {SupportToData} from '../types/chameleon-platform.enum';
import {EntityDataUtils} from '../utils/EntityDataUtils';

@Entity()
export class Model extends Common implements SupportToData {
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

    toData() {
        return EntityDataUtils.toData([
            'id',
            'createdTime',
            'updatedTime',
            'uniqueName',
            'name',
            'description',
            'register',
            'image',
            'cacheSize',
            'inputType',
            'outputType',
            'parameters',
            'config'], this);
    }
}
