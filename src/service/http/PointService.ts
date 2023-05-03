import * as express from 'express';
import {Application, Request, Response} from 'express';
import {RESPONSE_MESSAGE} from '../../constant/Constants';
import {HTTPService} from '../interfaces/http/HTTPService';
import {Server} from 'http';
import {HTTPLogUtils} from '../../utils/HTTPLogUtils';

// TODO: management exception
export class PointService extends HTTPService {
    init(app: Application, server: Server) {
        const router = express.Router();
        router.get('/my', HTTPLogUtils.addBeginLogger(this.handleMy, 'Point:my'));
        router.post('/update', HTTPLogUtils.addBeginLogger(this.handleMy, 'Point:update'));
        app.use('/point', router);
    }

    async handleMy(req: Request, res: Response, next: Function) {
        const {id} = req.query;
        if (!id) return res.status(501).send(RESPONSE_MESSAGE.NON_FIELD);
        console.log(id);
        const point = await this.walletController.findWalletByUserId(Number(id));
        return res.status(200).send({
            'point': point.point,
        });
    }

    async getUserWallet(req: Request, res: Response, next: Function) {
        const {id} = req.query;
        if (!req.isAuthenticated()) return res.status(501).send(RESPONSE_MESSAGE.NOT_AUTH);
        if (!id) return res.status(501).send(RESPONSE_MESSAGE.NON_FIELD);
        const wallet = await this.walletController.findWalletByUserId(Number(id));
        return res.status(200).send({
            wallet
        });
    }

    // TODO: 리팩토링 필요
    async handleUpdate(req: Request, res: Response, next: Function) {
        const {amount} = req.body;
        if (!req.isAuthenticated()) return res.status(501).send(RESPONSE_MESSAGE.NOT_AUTH);
        if (!amount) return res.status(501).send(RESPONSE_MESSAGE.NON_FIELD);
        if (!(await this.walletController.findWalletByUserId(Number(req.user['id'])))) return res.status(501).send(RESPONSE_MESSAGE.NOT_FOUND);
        if ((await this.walletController.findWalletByUserId(Number(req.user['id'])))['point'] + Number(amount) < 0) return res.status(501).send(RESPONSE_MESSAGE.WRONG_REQ);
        await this.walletController.updateAmount(req.user['id'], amount);
        return res.status(200).send(RESPONSE_MESSAGE);
    }
}