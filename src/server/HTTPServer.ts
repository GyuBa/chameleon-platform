import * as express from 'express';
import {Application} from 'express';
import * as http from 'http';
import {Server} from 'http';
import {HTTPHandler} from '../types/chameleon-platform';
import * as expressWs from "express-ws";

export default class HTTPServer {
    readonly app: expressWs.Application;
    readonly server: Server;

    constructor(options?: expressWs.Options) {
        const application = express();
        this.server = http.createServer(application);
        this.app = expressWs(application).app;
    }

    addHandler(httpHandler: HTTPHandler) {
        httpHandler.init(this.app, this.server);
    }

    listen(port: number) {
        this.app.listen(port, () => {
            console.log(`HTTPServer Listening on ${port}.`);
        });
    }

    close() {
        this.server.close(() => {
            console.log('HTTPServer closed.');
        });
    }
}