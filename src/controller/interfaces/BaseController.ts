import {Repository} from 'typeorm/repository/Repository';
import {EntityTarget} from 'typeorm/common/EntityTarget';
import {ObjectLiteral} from 'typeorm/common/ObjectLiteral';
import {DataSource} from 'typeorm';

export class BaseController<Entity extends ObjectLiteral & { id: number | string }> {
    public repository: Repository<Entity>;
    protected source: DataSource;

    constructor(source: DataSource, target: EntityTarget<Entity>) {
        this.source = source;
        this.repository = source.getRepository(target);
    }

    async save(entity: Entity): Promise<Entity> {
        try {
            return await this.repository.save(entity);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async findById(id: number): Promise<Entity> {
        try {
            return await this.repository
                .createQueryBuilder()
                .select()
                .where('id=:id', {id})
                .getOne();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async delete(entity: Entity) {
        try {
            await this.repository.delete(entity);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async deleteById(id: number) {
        try {
            await this.repository.delete(id);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getAll(): Promise<Entity[]> {
        try {
            return await this.repository.find();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}