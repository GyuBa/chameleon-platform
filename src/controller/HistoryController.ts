import {BaseController} from './interfaces/BaseController';
import {History} from '../entities/History';
import {DataSource, SelectQueryBuilder} from 'typeorm';
import {Model} from '../entities/Model';
import {Image} from '../entities/Image';
import {ModelController} from './ModelController';
import {HistoryStatus} from '../types/chameleon-platform.enum';

export class HistoryController extends BaseController<History> {
    constructor(source: DataSource) {
        super(source, History);
    }

    public static selectWithJoin(queryBuilder: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
        queryBuilder = queryBuilder.leftJoinAndSelect('History.model', 'Model');
        queryBuilder = queryBuilder.leftJoinAndSelect('History.executor', 'Executor');
        queryBuilder = ModelController.selectWithJoin(queryBuilder);
        return queryBuilder;
    }

    async findById(id: number): Promise<History> {
        try {
            return HistoryController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .where('History.id=:id', {id})
                .getOne();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async findAllByStatus(status: string): Promise<History[]> {
        try {
            return await this.repository
                .createQueryBuilder()
                .select()
                .where('status=:status', {status})
                .getMany();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async findAllByImageAndStatus(image: Image, status: string): Promise<History[]> {
        try {
            return await HistoryController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .where('Image.id=:imageId', {imageId: image.id})
                .andWhere('History.status=:status', {status})
                .getMany();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async findAndUseCache(image: Image): Promise<History> {
        return await this.source.transaction<History>('SERIALIZABLE', async manager => {
            let history;
            const cachedHistories = await this.findAllByImageAndStatus(image, HistoryStatus.CACHED);
            const existCache = cachedHistories.length > 0;

            if (existCache) {
                history = cachedHistories.shift();
                history.status = HistoryStatus.INITIALIZING;
                await this.save(history);
            }
            return history;
        });
    }
}