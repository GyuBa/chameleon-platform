import {Column, Entity, JoinColumn, ManyToOne} from 'typeorm';
import {Common} from './interfaces/Common';
import {History} from "./History";
import {ModelInputType, PointHistoryType} from "../types/chameleon-platform.common";
import {User} from "./User";

@Entity()
export class PointHistory extends Common {
    @ManyToOne(
        () => User
    )
    @JoinColumn()
        user: User;

    @ManyToOne(
        () => History,
        {nullable: true}
    )
    @JoinColumn()
        modelHistory: History;

    @Column({type: 'enum', enum: PointHistoryType})
        type: PointHistoryType;

    @Column()
        delta: number;

    @Column()
        leftPoint: number;
}
