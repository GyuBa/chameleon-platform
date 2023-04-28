import {Model} from '../entities/Model';
import {Image} from '../entities/Image';
import {BaseController} from './interfaces/BaseController';
import {DataSource} from "typeorm";

export class ModelController extends BaseController<Model> {
    constructor(source: DataSource) {
        super(source, Model);
    }


    async createModel(model: Model) {
        try {
            return await this.repository.save(model);
        } catch (e) {
            console.error(e);
        }
    }

    async findModelById(id: number) {
        try {
            return await this.repository
                .createQueryBuilder()
                .select()
                .leftJoinAndSelect('Model.register', 'User')
                .leftJoinAndSelect('Model.image', 'Image')
                .leftJoinAndSelect('Image.region', 'Region')
                .where('Model.id = :id', { id })
                .getOne();
        } catch (e) {
            console.error(e);
        }
    }
    // image update 시 update 가 아니라 기존 image 재 등록
    async findModelByImage(image: Image) {
        try {
            return await this.repository
                .createQueryBuilder()
                .select('model')
                .where('imageId=:id', image)
                .getOne();
        } catch (e) {
            console.error(e);
        }
    }


    async findModelByUniqueName(uniqueName: string) {
        try {
            return await this.repository
                .createQueryBuilder('model')
                .leftJoinAndSelect('model.register', 'user')
                .leftJoinAndSelect('model.image', 'image')
                .leftJoinAndSelect('image.region', 'region')
                .select('model')
                .addSelect('user.username')
                // .addSelect('region/.name')
                .addSelect('image')
                .addSelect('region.name')
                .where('uniqueName=:uniqueName', {uniqueName:uniqueName})
                .getOne();
        } catch (e) {
            console.error(e);
        }
    }

    async getAllModel() {
        try {
            return await this.repository
                .createQueryBuilder('model')
                .leftJoinAndSelect('model.register', 'user')
                .leftJoinAndSelect('model.image', 'image')
                .leftJoinAndSelect('image.region', 'region')
                .select('model')
                .addSelect('user.username')
                // .addSelect('region/.name')
                .addSelect('image')
                .addSelect('region.name')
                .getMany();
        } catch (e) {
            console.error(e);
        }
    }

    async deleteModel(modelId) {
        try {
            await this.repository
                .createQueryBuilder()
                .delete()
                .from(Model)
                .where('id=:id', {id: modelId})
                .execute();
        } catch (e) {
            console.error(e);
        }
    }

    async updateModel(modelId: number, modelData: { name: string, description: string, inputType: string, outputType: string }) {
        const {name, description, inputType, outputType} = modelData;

        try {
            const model = await this.findModelById(modelId);
            await this.repository
                .createQueryBuilder()
                .update(model)
                .set({
                    name: name,
                    description: description,
                    inputType: inputType,
                    outputType: outputType
                });
        } catch (e) {
            console.error(e);
        }
    }

}