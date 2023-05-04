import {Column, Entity, JoinColumn, ManyToOne} from 'typeorm';
import {Common} from './interfaces/Common';
import {Model} from './Model';
import {User} from './User';
import {HistoryStatus} from '../types/chameleon-platform.enum';

@Entity()
export class History extends Common{
    @Column({type: 'enum', enum: HistoryStatus})
        status: string;
    @Column()
        containerId: string;
    @Column({nullable: true})
        inputPath: string;
    @Column({nullable: true, type: 'json'})
        inputInfo: any;

    @Column({nullable: true})
        outputPath: string;
    @Column({nullable: true, type: 'json'})
        outputInfo: any;
    @Column({nullable: true, type: 'text'})
        description: string;
    @ManyToOne(
        () => User,
        (user) => user.id
    )
    @JoinColumn()
        executor: User;

    @ManyToOne(
        () => Model,
        (model) => model.id
    )
    @JoinColumn()
        model: Model;

    @Column({nullable: true})
        startedTime: Date;
    @Column({nullable: true})
        endedTime: Date;

    @Column({nullable: true, type: 'json'})
        parameters: any;
    @Column({nullable: true, type: 'text'})
        terminal: string;

}

