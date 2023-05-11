import * as express from 'express';
import {Application, Request, Response} from 'express';
import {HTTPService} from '../interfaces/http/HTTPService';
import {Server} from 'http';
import {HTTPLogUtils} from '../../utils/HTTPLogUtils';
import {ResponseData} from '../../types/chameleon-platform.common';

export class RegionService extends HTTPService {
    init(app: Application, server: Server) {
        const router = express.Router();
        router.get('/', HTTPLogUtils.addBeginLogger(this.handleList, '/regions/list'));
        app.use('/regions', router);
    }

    async handleList(req: Request, res: Response, next: Function) {
        try {
            const result = (await this.regionController.getAll()).map(r => r.toData());
            return res.status(200).send(result);
        } catch (e) {
            return res.status(501).send({msg: 'server_error'} as ResponseData);
        }
    }
}
