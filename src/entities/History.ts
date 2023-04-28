import {Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
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
    @ManyToOne(
        () => User,
        (user) => user.id
    )
    @JoinColumn()
        register: User;

    @ManyToOne(
        () => Model,
        (model) => model.id
    )
    @JoinColumn()
        targetModel: Model;
}