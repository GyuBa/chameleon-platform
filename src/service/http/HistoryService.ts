import * as express from 'express';
import {Application, Request, Response} from 'express';
import {HTTPService} from '../interfaces/http/HTTPService';
import {Server} from 'http';
import {RESPONSE_MESSAGE} from '../../constant/Constants';
import {User} from '../../entities/User';
import {HTTPLogUtils} from '../../utils/HTTPLogUtils';

export class HistoryService extends HTTPService {
    init(app: Application, server: Server) {
        const router = express.Router();
        router.get('/', HTTPLogUtils.addBeginLogger(this.handleGetHistories, '/histories'));
        app.use('/histories', router);
    }

    async handleGetHistories(req: Request, res: Response, next: Function) {
        if (!req.isAuthenticated()) return res.status(401).send(RESPONSE_MESSAGE.NOT_AUTH);
        const ownOnly = req.query.ownOnly === 'true';
        const user = req.user as User;
        const responseData = (ownOnly ? await this.historyController.findAllByExecutorId(user.id) : await this.historyController.getAll()).map(m => m.toData());
        return res.status(200).send(responseData);
    }
}