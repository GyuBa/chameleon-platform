import * as express from 'express';
import {Application} from 'express';
import {HTTPService} from '../interfaces/http/HTTPService';
import {Server} from 'http';
import * as session from 'express-session';
import {TypeormStore} from 'connect-typeorm';
import PlatformServer from '../../server/core/PlatformServer';

export class ExpressService extends HTTPService {
    init(app: Application, server: Server) {
        app.use(express.json());
        app.use(session({
            resave: false,
            saveUninitialized: false,
            store: new TypeormStore({
                cleanupLimit: 2,
                limitSubquery: false, // If using MariaDB.
                ttl: 86400
            }).connect(this.sessionController.repository),
            secret: PlatformServer.config.sessionSecret,
            cookie: {httpOnly: false}
        }));
    }
}
