import {Column, Entity, JoinColumn, OneToMany} from 'typeorm';
import {Common} from './interfaces/Common';
import {Model} from './Model';
import {User} from './User';

// ubuntu:latest
@Entity()
export class History extends Common {
    @Column()
        inputPath: string;
    @Column()
        outputPath: string;
    @OneToMany(
        () => User,
        (user) => user.id
    )
    @JoinColumn()
        register: User;

    @OneToMany(
        () => Model,
        (model) => model.id
    )
    @JoinColumn()
        model: Model;

}