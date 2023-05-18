import {CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {ENTITY_DATA_KEYS} from "../../types/chameleon-platform.common";

@Entity()
export class Common {
    @PrimaryGeneratedColumn()
        id: number;

    @CreateDateColumn()
        createdTime: Date;

    @UpdateDateColumn()
        updatedTime: Date;


    get dataKeys() {
        return ENTITY_DATA_KEYS[this.constructor.name];
    }

    toData() {
        return this.dataKeys.reduce((obj, key) => this[key] !== undefined ? {
            ...obj,
            [key]: this[key]?.toData ? this[key].toData() : this[key]
        } : obj, {});
    }
}