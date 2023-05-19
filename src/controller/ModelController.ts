import {Model} from '../entities/Model';
import {Image} from '../entities/Image';
import {BaseController} from './interfaces/BaseController';
import {DataSource, SelectQueryBuilder} from 'typeorm';
import {ImageController} from './ImageController';
import {ModelSearchOption} from "../types/chameleon-platform.common";

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

    async findByUsernameAndUniqueName(username: string, uniqueName: string): Promise<Model> {
        try {
            return await await ModelController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .where('Register=:username', {username})
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

    async findBySearchOption(option: ModelSearchOption, searchTerm: string, ownOnly?: boolean, userId?: number): Promise<Model[]> {
        try {

            let queryBuilder = ModelController.selectWithJoin(this.repository.createQueryBuilder())
                .select();
            if (ownOnly && userId) {
                queryBuilder = queryBuilder.where('Register.id=:userId', {userId});
            }
            if (option && searchTerm) {
                switch (option) {
                case ModelSearchOption.NAME:
                    searchTerm = `%${searchTerm}%`;
                    queryBuilder = queryBuilder.andWhere('Model.name LIKE :searchTerm', {searchTerm});
                    break;
                case ModelSearchOption.DESCRIPTION:
                    searchTerm = `%${searchTerm}%`;
                    queryBuilder = queryBuilder.andWhere('Model.description LIKE :searchTerm', {searchTerm});
                    break;
                case ModelSearchOption.NAME_AND_DESCRIPTION:
                    searchTerm = `%${searchTerm}%`;
                    queryBuilder = queryBuilder.andWhere('(Model.name LIKE :searchTerm OR Model.description LIKE :searchTerm)', {searchTerm});
                    break;
                case ModelSearchOption.CATEGORY:
                    searchTerm = `%${searchTerm}%`;
                    queryBuilder = queryBuilder.andWhere('Model.category LIKE :searchTerm', {searchTerm});
                    break;
                case ModelSearchOption.INPUT_TYPE:
                    queryBuilder = queryBuilder.andWhere('Model.inputType=:searchTerm', {searchTerm});
                    break;
                case ModelSearchOption.OUTPUT_TYPE:
                    queryBuilder = queryBuilder.andWhere('Model.outputType=:searchTerm', {searchTerm});
                    break;
                case ModelSearchOption.REGISTER:
                    queryBuilder = queryBuilder.andWhere('Register.username=:searchTerm', {searchTerm});
                    break;
                default:
                    break;
                }
            }
            return await queryBuilder.getMany();
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