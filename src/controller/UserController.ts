import {User} from '../entities/User';
import {BaseController} from './interfaces/BaseController';
import {DataSource} from 'typeorm';

export class UserController extends BaseController<User> {
    constructor(source: DataSource) {
        super(source, User);
    }

    /**
     * Search User data on user table
     * @param {string} userEmail - user Email to be searched
     */
    async findByEmail(email: string): Promise<User> {
        try {
            return await this.repository
                .createQueryBuilder()
                .where('email=:email', {email})
                .getOne();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}