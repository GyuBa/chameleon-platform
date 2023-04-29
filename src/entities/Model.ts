import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from 'typeorm';
import {Common} from './interfaces/Common';
import {User} from './User';
import {Image} from './Image';

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
        parameter: string;
    @Column()
        config: string;
}
