import {BaseController} from './interfaces/BaseController';
import {DataSource, SelectQueryBuilder} from 'typeorm';
import {HistoryController} from './HistoryController';
import {EarnedPointHistory} from '../entities/EarnedPointHistory';
import {ModelController} from "./ModelController";

export class EarnedPointHistoryController extends BaseController<EarnedPointHistory> {
    constructor(source: DataSource) {
        super(source, EarnedPointHistory);
    }

    public static selectWithJoin(queryBuilder: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
        queryBuilder = queryBuilder.leftJoinAndSelect('EarnedPointHistory.model', 'Model');
        queryBuilder = queryBuilder.leftJoinAndSelect('EarnedPointHistory.user', 'EarnedPointHistoryUser');
        queryBuilder = queryBuilder.leftJoinAndSelect('EarnedPointHistory.executor', 'EarnedPointHistoryExecutor');
        queryBuilder = ModelController.selectWithJoin(queryBuilder);
        return queryBuilder;
    }

    async findById(id: number): Promise<EarnedPointHistory> {
        try {
            return EarnedPointHistoryController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .where('EarnedPointHistoryUser.id=:id', {id})
                .getOne();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async findAllByUserId(id: number): Promise<EarnedPointHistory[]> {
        try {
            return await EarnedPointHistoryController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .where('EarnedPointHistoryUser.id=:id', {id})
                .getMany();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async findAllByModelId(id: number): Promise<EarnedPointHistory[]> {
        try {
            return await EarnedPointHistoryController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .where('Model.id=:id', {id})
                .getMany();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getAll(): Promise<EarnedPointHistory[]> {
        try {
            return EarnedPointHistoryController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .getMany();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}