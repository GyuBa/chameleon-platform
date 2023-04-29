import {Region} from '../entities/Region';
import {BaseController} from './interfaces/BaseController';
import {DataSource, SelectQueryBuilder} from 'typeorm';

export class RegionController extends BaseController<Region> {
    constructor(source: DataSource) {
        super(source, Region);
    }

    async findRegionByHost(host: string) {
        try {
            return await this.repository
                .createQueryBuilder()
                .select()
                .where('host=:host', {host})
                .getOne();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async findRegionByPort(port: number) {
        try {
            return await this.repository
                .createQueryBuilder('region')
                .select()
                .where('port=:port', {port})
                .getOne();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async findRegionByName(name: string) {
        try {
            return await this.repository
                .createQueryBuilder()
                .select()
                .where('name=:name', {name})
                .getOne();
        } catch(e) {
            console.error(e);
            throw e;
        }
    }
}