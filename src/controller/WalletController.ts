import {Wallet} from '../entities/Wallet';
import {BaseController} from './interfaces/BaseController';
import {DataSource} from 'typeorm';

export class WalletController extends BaseController<Wallet> {
    constructor(source: DataSource) {
        super(source, Wallet);
    }

    async findByUserId(userId: number): Promise<Wallet> {
        try {
            const wallet = await this.repository.findOne({
                where: {user: {id: userId}},
            });
            return wallet;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async updateAmount(userId: number, amount: number) {
        try {
            const wallet = await this.findByUserId(userId);
            await this.repository
                .createQueryBuilder()
                .update(wallet)
                .set({
                    point: () => `point + ${amount}`
                })
                .where('userId=:userId', {userId})
                .execute();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}