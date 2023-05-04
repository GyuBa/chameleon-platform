import {CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {EntityDataKeys} from '../../types/chameleon-platform.entitydata.keys';

@Entity()
export class Common {
    @PrimaryGeneratedColumn()
        id: number;

    @CreateDateColumn()
        createdTime: Date;

    @UpdateDateColumn()
        updatedTime: Date;


    get dataKeys() {
        return EntityDataKeys[this.constructor.name];
    }

    toData() {
        return this.dataKeys.reduce((obj, key) => this[key] ? {
            ...obj,
            [key]: this[key]?.toData ? this[key].toData() : this[key]
        } : obj, {});
    }
}