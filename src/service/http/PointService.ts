import * as express from 'express';
import {Application, Request, Response} from 'express';
import {RESPONSE_MESSAGE} from '../../constant/Constants';
import {HTTPService} from '../interfaces/http/HTTPService';
import {Server} from 'http';

// TODO: management exception
export class PointService extends HTTPService {
    init(app: Application, server: Server) {
        const router = express.Router();
        router.get('/', this.getUserPoint);
        router.post('/update', this.updatePoint);
        app.use('/point', router);
    }

    async getUserPoint(req: Request, res: Response) {
        const {id} = req.query;
        if (!id) return res.status(501).send(RESPONSE_MESSAGE.NON_FIELD);
        console.log(id);
        const point = await this.walletController.findWalletByUserId(Number(id));
        return res.status(200).send({
            'point': point.point,
        });
    }

    async getUserWallet(req: Request, res: Response) {
        const {id} = req.query;
        if (!req.isAuthenticated()) return res.status(501).send(RESPONSE_MESSAGE.NOT_AUTH);
        if (!id) return res.status(501).send(RESPONSE_MESSAGE.NON_FIELD);
        const wallet = await this.walletController.findWalletByUserId(Number(id));
        return res.status(200).send({
            wallet
        });
    }

    async updatePoint(req: Request, res: Response) {
        const {amount} = req.body;
        if (!req.isAuthenticated()) return res.status(501).send(RESPONSE_MESSAGE.NOT_AUTH);
        if (!amount) return res.status(501).send(RESPONSE_MESSAGE.NON_FIELD);
        if (!(await this.walletController.findWalletByUserId(Number(req.user['id'])))) return res.status(501).send(RESPONSE_MESSAGE.NOT_FOUND);
        if ((await this.walletController.findWalletByUserId(Number(req.user['id'])))['point'] + Number(amount) < 0) return res.status(501).send(RESPONSE_MESSAGE.WRONG_REQ);
        await this.walletController.updateAmount(req.user['id'], amount);
        return res.status(200).send(RESPONSE_MESSAGE);
    }
}