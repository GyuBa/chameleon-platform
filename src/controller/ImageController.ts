import {Image} from '../entities/Image';
import {DataSource, SelectQueryBuilder} from 'typeorm';
import {BaseController} from './interfaces/BaseController';

export class ImageController extends BaseController<Image> {
    constructor(source: DataSource) {
        super(source, Image);
    }

    public static selectWithJoin(queryBuilder: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
        return queryBuilder
            .leftJoinAndSelect('Image.region', 'Region');
    }

    async findByRepositoryAndTag(repository: string, tag: string): Promise<Image> {
        try {
            return await ImageController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .where('Image.tag=:tag', {tag})
                .andWhere('Image.repository=:repository', {repository})
                .getOne();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async findAllByRepositoryAndTagLike(repository: string, tag: string): Promise<Image[]> {
        try {
            return await ImageController.selectWithJoin(this.repository.createQueryBuilder())
                .select()
                .where('Image.repository=:repository', {repository})
                .andWhere('Image.tag like:tag', {tag: `${tag}%`})
                .getMany();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}