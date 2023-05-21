import * as express from 'express';
import {Application, Request, Response} from 'express';
import {HTTPService} from '../interfaces/http/HTTPService';
import {Server} from 'http';
import {HTTPLogUtils} from '../../utils/HTTPLogUtils';
import {PointHistoryType, ResponseData} from '../../types/chameleon-platform.common';
import axios from "axios";
import {PaymentAPI} from "../../platform/PaymentAPI";
import {PlatformAPI} from "../../platform/PlatformAPI";
import {PlatformService} from "../interfaces/PlatformService";
import PlatformServer from "../../server/core/PlatformServer";
import {User} from "../../entities/User";
import {PointHistory} from "../../entities/PointHistory";

// TODO: management exception
export class PointService extends HTTPService {
    init(app: Application, server: Server) {
        const router = express.Router();
        router.get('/my', HTTPLogUtils.addBeginLogger(this.handleMy, '/points/my'));
        router.post('/charge', HTTPLogUtils.addBeginLogger(this.handleCharge, '/points/charge'));
        router.post('/', HTTPLogUtils.addBeginLogger(this.handleGetPointHistories, '/'));
        app.use('/points', router);
    }

    async handleMy(req: Request, res: Response, next: Function) {
        const {id} = req.query;
        if (!id) return res.status(501).send({msg: 'non_field_error'} as ResponseData);
        const point = await this.walletController.findByUserId(Number(id));
        return res.status(200).send({
            'point': point.point,
        });
    }

    async handleCharge(req: Request, res: Response, next: Function) {
        const {paymentResponse} = req.body;
        if (!req.isAuthenticated()) return res.status(501).send({msg: 'not_authenticated_error'} as ResponseData);
        const user = req.user as User;
        const token = await PaymentAPI.getToken(PlatformServer.config.imp.key, PlatformServer.config.imp.secret);
        const data = await PaymentAPI.getPaymentData(token, paymentResponse.imp_uid);
        user.point += data.amount;
        await this.userController.save(user);
        const pointHistory = new PointHistory();
        pointHistory.delta = data.amount;
        pointHistory.leftPoint = user.point;
        pointHistory.user = user;
        pointHistory.type = PointHistoryType.CHARGE;
        await this.pointHistoryController.save(pointHistory);
        return res.status(200).send({msg: 'ok'} as ResponseData);
    }

    async handleGetPointHistories(req: Request, res: Response, next: Function) {
        if (!req.isAuthenticated()) return res.status(501).send({msg: 'not_authenticated_error'} as ResponseData);
        const user = req.user as User;
        const pointHistories = await this.pointHistoryController.findAllByUserId(user.id);
        return res.status(200).send(pointHistories.map(p => p.toData()));
    }
}