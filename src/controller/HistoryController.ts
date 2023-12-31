import {BaseController} from './interfaces/BaseController';
import {History} from '../entities/History';
import {DataSource, SelectQueryBuilder} from 'typeorm';
import {Model} from '../entities/Model';
import {Image} from '../entities/Image';
import {ModelController} from './ModelController';
import {HistoryStatus} from '../types/chameleon-platform.common';

export class HistoryController extends BaseController<History> {
    constructor(source: DataSource) {
        super(source, History);
    }

    public static selectWithJoin(queryBuilder: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
        queryBuilder = queryBuilder.leftJoinAndSelect('History.model', 'Model');
        queryBuilder = queryBuilder.leftJoinAndSelect('History.executor', 'Executor');
        queryBuilder = queryBuilder.leftJoinAndSelect('History.parent', 'Parent');
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

    async getAll(): Promise<History[]> {
        try {
            return HistoryController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .getMany();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async findByOutputPath(outputPath: string): Promise<History> {
        try {
            return await HistoryController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .where('History.outputPath=:outputPath', {outputPath})
                .getOne();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async findAllByExecutorId(executorId: number): Promise<History[]> {
        try {
            return HistoryController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .where('Executor.id=:executorId', {executorId})
                .orderBy('History.startedTime', 'ASC')
                .getMany();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async findPaidAllByExecutorId(executorId: number): Promise<History[]> {
        try {
            return HistoryController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .where('Executor.id=:executorId', {executorId})
                .where('History.price > 0')
                .orderBy('History.startedTime', 'ASC')
                .getMany();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async findAllByModelId(modelId: number): Promise<History[]> {
        try {
            return HistoryController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .where('Model.id=:modelId', {modelId})
                .orderBy('History.startedTime', 'ASC')
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
                .where('Image.id=:id', image)
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