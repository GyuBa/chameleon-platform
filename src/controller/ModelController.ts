import {Model} from '../entities/Model';
import {Image} from '../entities/Image';
import {BaseController} from './interfaces/BaseController';
import {DataSource, SelectQueryBuilder} from 'typeorm';
import {ImageController} from './ImageController';

export class ModelController extends BaseController<Model> {
    constructor(source: DataSource) {
        super(source, Model);
    }

    public static selectWithJoin(queryBuilder: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
        queryBuilder = queryBuilder
            .leftJoinAndSelect('Model.register', 'Register')
            .leftJoinAndSelect('Model.image', 'Image');
        queryBuilder = ImageController.selectWithJoin(queryBuilder);
        return queryBuilder;
    }

    async findById(id: number): Promise<Model> {
        try {
            return await ModelController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .where('Model.id=:id', {id})
                .getOne();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    // image update 시 update 가 아니라 기존 image 재 등록
    async findByImage(image: Image): Promise<Model> {
        try {
            return await await ModelController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .where('Model.imageId=:id', image)
                .getOne();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async findByUniqueName(uniqueName: string): Promise<Model> {
        try {
            return await await ModelController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .where('Model.uniqueName=:uniqueName', {uniqueName})
                .getOne();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async findAllByUserId(userId: number): Promise<Model[]> {
        try {
            return await await ModelController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .where('Register.id=:userId', {userId})
                .getMany();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getAll(): Promise<Model[]> {
        try {
            return await ModelController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .getMany();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}