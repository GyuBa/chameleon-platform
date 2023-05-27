import {Column, Entity, JoinColumn, ManyToOne} from 'typeorm';
import {Common} from './interfaces/Common';
import {History} from "./History";
import {ModelInputType, PointHistoryType} from "../types/chameleon-platform.common";
import {User} from "./User";
import {Model} from "./Model";

@Entity()
export class EarnedPointHistory extends Common {
    @ManyToOne(
        () => User
    )
    @JoinColumn()
        user: User;

    @ManyToOne(
        () => User
    )
    @JoinColumn()
        executor: User;

    @ManyToOne(
        () => Model,
        {nullable: true}
    )
    @JoinColumn()
        model: Model;

    @Column()
        delta: number;

    @Column()
        leftEarnedPoint: number;
}
