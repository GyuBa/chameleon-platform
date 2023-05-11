import * as express from 'express';
import {Application, Request, Response} from 'express';
import {HTTPService} from '../interfaces/http/HTTPService';
import {Server} from 'http';
import {HTTPLogUtils} from '../../utils/HTTPLogUtils';
import {ResponseData} from '../../types/chameleon-platform.common';

// TODO: management exception
export class PointService extends HTTPService {
    init(app: Application, server: Server) {
        const router = express.Router();
        router.get('/my', HTTPLogUtils.addBeginLogger(this.handleMy, '/points/my'));
        router.post('/update', HTTPLogUtils.addBeginLogger(this.handleMy, '/points/update'));
        app.use('/points', router);
    }

    async handleMy(req: Request, res: Response, next: Function) {
        const {id} = req.query;
        if (!id) return res.status(501).send({msg: 'non_field_error'} as ResponseData);
        console.log(id);
        const point = await this.walletController.findByUserId(Number(id));
        return res.status(200).send({
            'point': point.point,
        });
    }

    async getUserWallet(req: Request, res: Response, next: Function) {
        const {id} = req.query;
        if (!req.isAuthenticated()) return res.status(501).send({msg: 'not_authenticated_error'} as ResponseData);
        if (!id) return res.status(501).send({msg: 'non_field_error'} as ResponseData);
        const wallet = await this.walletController.findByUserId(Number(id));
        return res.status(200).send({
            wallet
        });
    }

    // TODO: 리팩토링 필요
    async handleUpdate(req: Request, res: Response, next: Function) {
        const {amount} = req.body;
        if (!req.isAuthenticated()) return res.status(501).send({msg: 'not_authenticated_error'} as ResponseData);
        if (!amount) return res.status(501).send({msg: 'non_field_error'} as ResponseData);
        if (!(await this.walletController.findByUserId(Number(req.user['id'])))) return res.status(501).send({msg: 'not_found_error'} as ResponseData);
        if ((await this.walletController.findByUserId(Number(req.user['id'])))['point'] + Number(amount) < 0) return res.status(501).send({msg: 'wrong_request_error'} as ResponseData);
        await this.walletController.updateAmount(req.user['id'], amount);
        return res.status(200).send({msg: 'ok'} as ResponseData);
    }
}