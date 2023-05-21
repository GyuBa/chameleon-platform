import {BaseController} from './interfaces/BaseController';
import {DataSource, SelectQueryBuilder} from 'typeorm';
import {ModelController} from './ModelController';
import {PointHistory} from '../entities/PointHistory';
import {HistoryController} from "./HistoryController";

export class PointHistoryController extends BaseController<PointHistory> {
    constructor(source: DataSource) {
        super(source, PointHistory);
    }

    public static selectWithJoin(queryBuilder: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
        queryBuilder = queryBuilder.leftJoinAndSelect('PointHistory.modelHistory', 'History');
        queryBuilder = queryBuilder.leftJoinAndSelect('PointHistory.user', 'PointHistoryUser');
        queryBuilder = HistoryController.selectWithJoin(queryBuilder);
        return queryBuilder;
    }

    async findById(id: number): Promise<PointHistory> {
        try {
            return PointHistoryController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .where('PointHistory.id=:id', {id})
                .getOne();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async findAllByUserId(id: number): Promise<PointHistory[]> {
        try {
            return await PointHistoryController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .where('PointHistoryUser.id=:id', {id})
                .getMany();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getAll(): Promise<PointHistory[]> {
        try {
            return PointHistoryController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .getMany();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}