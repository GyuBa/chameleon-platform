import * as express from 'express';
import {Application, Request, Response} from 'express';
import {HTTPService} from '../interfaces/http/HTTPService';
import {Server} from 'http';
import {User} from '../../entities/User';
import {HTTPLogUtils} from '../../utils/HTTPLogUtils';
import {HistoryStatus, ResponseData} from '../../types/chameleon-platform.common';

export class HistoryService extends HTTPService {
    init(app: Application, server: Server) {
        const router = express.Router();
        router.get('/', HTTPLogUtils.addBeginLogger(this.handleGetHistories, '/histories'));
        router.get('/:id', HTTPLogUtils.addBeginLogger(this.handleGetHistoryById, '/histories/:id'));
        app.use('/histories', router);
    }

    async handleGetHistories(req: Request, res: Response, next: Function) {
        if (!req.isAuthenticated()) return res.status(401).send({msg: 'not_authenticated_error'} as ResponseData);
        const paidOnly = req.query.paidOnly === 'true';
        const user = req.user as User;
        const responseData = (paidOnly ? await this.historyController.findPaidAllByExecutorId(user.id) : await this.historyController.findAllByExecutorId(user.id)).filter(h => h.status !== HistoryStatus.CACHED).map(m => m.toData());
        return res.status(200).send(responseData);
    }

    async handleGetHistoryById(req: Request, res: Response, next: Function) {
        if (!req.isAuthenticated()) return res.status(401).send({msg: 'not_authenticated_error'} as ResponseData);
        const id = req.params?.id;
        const user = req.user as User;
        if (!id || Number.isNaN(id)) return res.status(401).send({msg: 'non_field_error'} as ResponseData);
        try {
            const historyResult = await this.historyController.findById(parseInt(id));
            if (!historyResult) return res.status(404).send({msg: 'not_found_error'} as ResponseData);
            if (historyResult.executor.id !== user.id) return res.status(404).send({msg: 'wrong_permission_error', 'reason': 'Not this user\'s History.'} as ResponseData);
            return res.status(200).send(historyResult.toData());
        } catch (e) {
            return res.status(501).send({msg: 'server_error'} as ResponseData);
        }
    }
}