import {Region} from '../entities/Region';
import {Image} from '../entities/Image';
import {DataSource} from 'typeorm';
import {BaseController} from './interfaces/BaseController';

export class ImageController extends BaseController<Image> {
    constructor(source: DataSource) {
        super(source, Image);
    }

    async createImage(image: Image) {
        try {
            return await this.repository.save(image);
        } catch (e) {
            console.error(e);
        }
    }

    async findImageById(id: number) {
        try {
            return await this.repository
                .createQueryBuilder()
                .select()
                .where('id=:id', {id})
                .getOne();
        } catch (e) {
            console.error(e);
        }
    }

    async findImageByProperty(tag: string, repository: string) {
        try {
            return await this.repository
                .createQueryBuilder()
                .select()
                .where('tag=:tag', {tag: tag})
                .andWhere('repository=:repository', {repository})
                .getOne();
        } catch (e) {
            console.error(e);
        }
    }

    async findImageLikeTag(repository: string, tag: string) {
        try {
            return await this.repository
                .createQueryBuilder()
                .select()
                .where('repository=:repository', {repository})
                .andWhere('tag like:tag', {tag: `${tag}%`})
                .getMany();
        } catch (e) {
            console.error(e);
        }
    }

    async updateImage(imageId: number, imageData: { repository: string }) {
        const {repository} = imageData;

        try {
            const image = await this.findImageById(imageId);
            await this.repository
                .createQueryBuilder('image')
                .update(image)
                .set({
                    repository: repository
                });
        } catch (e) {
            console.error(e);
        }
    }

    async deleteImage(imageId: number) {

        try {
            await this.repository
                .createQueryBuilder()
                .delete()
                .from(Image)
                .where('id=:id', {id: imageId})
                .execute();
        } catch (e) {
            console.error(e);
        }
    }
}