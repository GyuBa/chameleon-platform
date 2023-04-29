import {BaseController} from './interfaces/BaseController';
import {History} from '../entities/History';
import {DataSource, SelectQueryBuilder} from 'typeorm';
import {Model} from '../entities/Model';
import {Image} from '../entities/Image';
import {ModelController} from './ModelController';

export class HistoryController extends BaseController<History> {
    constructor(source: DataSource) {
        super(source, History);
    }

    public static selectWithJoin(queryBuilder: SelectQueryBuilder<any>) {
        queryBuilder = queryBuilder.leftJoinAndSelect('History.model', 'Model');
        queryBuilder = ModelController.selectWithJoin(queryBuilder);
        return queryBuilder;
    }

    async findAllByStatus(status: string) {
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

    async findAllByImageAndStatus(image: Image, status: string) {
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
}