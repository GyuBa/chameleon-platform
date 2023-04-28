import {Region} from '../entities/Region';
import {BaseController} from './interfaces/BaseController';
import {DataSource} from "typeorm";

export class RegionController extends BaseController<Region> {
    constructor(source: DataSource) {
        super(source, Region);
    }

    async createRegion(region: Region) {
        try {
            await this.repository.save(region);
            return region;
        } catch (e) {
            console.error(e);
        }
    }

    async findRegionById(id: number) {
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

    async findRegionByHost(host: string) {
        try {
            return await this.repository
                .createQueryBuilder()
                .select()
                .where('host=:host', {host})
                .getOne();
        } catch (e) {
            console.error(e);
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
        }
    }

    async getAllRegions() {
        try {
            return await this.repository
                .createQueryBuilder()
                .select()
                .getMany();
        } catch(e) {
            console.error(e);
        }
    }
}