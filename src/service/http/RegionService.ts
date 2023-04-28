import * as express from 'express';
import {Application, Request, Response} from 'express';
import {HTTPService} from '../interfaces/http/HTTPService';
import {Server} from 'http';
import {RESPONSE_MESSAGE} from "../../constant/Constants";

export class RegionService extends HTTPService {
    init(app: Application, server: Server) {
        const router = express.Router();
        router.get('/list', this.regionList);
        app.use('/region', router);
    }

    async regionList(req: Request, res: Response, next: Function) {
        try {
            const result = (await this.regionController.getAllRegions()).map(({id, name}) => ({id, name}));
            return res.status(200).send(result);
        } catch (e) {
            return res.status(501).send(RESPONSE_MESSAGE.SERVER_ERROR);
        }
    }
}
