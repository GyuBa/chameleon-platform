import * as express from 'express';
import {Application, Request, Response} from 'express';
import {HTTPService} from '../interfaces/http/HTTPService';
import {Server} from 'http';
import {HTTPLogUtils} from "../../utils/HTTPLogUtils";
import {User} from "../../entities/User";
import {RESPONSE_MESSAGE} from "../../constant/Constants";

export class UserService extends HTTPService {
    init(app: Application, server: Server) {
        const router = express.Router();
        router.get('/info', HTTPLogUtils.addBeginLogger(this.handleInfo, 'User:info'));
        app.use('/user', router);
    }

    async handleInfo(req: Request, res: Response, next: Function) {
        if (req.isAuthenticated()) {
            res.status(200).send((req.user as User).toData());
        } else {
            res.status(401).send(RESPONSE_MESSAGE.NOT_AUTH);
        }
    }
}