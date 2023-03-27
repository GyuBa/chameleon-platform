import * as express from 'express';
import {Application} from 'express';
import {HTTPService} from '../interfaces/http/HTTPService';
import {Server} from 'http';
import * as fileUpload from 'express-fileupload';
import * as session from 'express-session';
import {TypeormStore} from 'connect-typeorm';

export class ExpressService extends HTTPService {
    init(app: Application, server: Server) {
        app.use(express.json());
        app.use(fileUpload());
        app.use(session({
            resave: false,
            saveUninitialized: false,
            store: new TypeormStore({
                cleanupLimit: 2,
                limitSubquery: false, // If using MariaDB.
                ttl: 86400
            }).connect(this.sessionController.repository),
            secret: 'keyboard cat'
        }));
    }
}