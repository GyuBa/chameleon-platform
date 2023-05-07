import {Region} from '../entities/Region';
import {BaseController} from './interfaces/BaseController';
import {DataSource} from 'typeorm';

export class RegionController extends BaseController<Region> {
    constructor(source: DataSource) {
        super(source, Region);
    }

    async findByHost(host: string): Promise<Region> {
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

    async findByPort(port: number): Promise<Region> {
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

    async findByName(name: string): Promise<Region> {
        try {
            return await this.repository
                .createQueryBuilder()
                .select()
                .where('name=:name', {name})
                .getOne();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}