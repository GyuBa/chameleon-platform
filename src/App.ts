import {AuthService} from './service/http/AuthService';
import {ModelService} from './service/http/ModelService';
import {PointService} from './service/http/PointService';
import {PassportService} from './service/http/passport/PassportService';
import HTTPServer from './server/HTTPServer';
import {DefaultSocketServer, DefaultWSServer} from './types/chameleon-platform';
import WSServer from './server/WSServer';
import DefaultWSManager from './server/impl/manager/DefaultWSManager';
import SocketServer from './server/SocketServer';
import DefaultSocketManager from './server/impl/manager/DefaultSocketManager';
import PlatformServer from './server/core/PlatformServer';
import DefaultWSHandler from './server/impl/handler/DefaultWSHandler';
import DefaultSocketHandler from './server/impl/handler/DefaultSocketHandler';
import {WSService} from './service/http/WSService';
import {ExpressService} from './service/http/ExpressService';
import {RegionService} from "./service/http/RegionService";

!async function () {
    const httpServer: HTTPServer = new HTTPServer();
    const wsServer: DefaultWSServer = new WSServer({
        server: httpServer.server, path: '/websocket',
        perMessageDeflate: {
            zlibDeflateOptions: {
                // See zlib defaults.
                chunkSize: 1024,
                memLevel: 7,
                level: 3
            },
            zlibInflateOptions: {
                chunkSize: 10 * 1024
            },
            // Other options settable:
            clientNoContextTakeover: true, // Defaults to negotiated value.
            serverNoContextTakeover: true, // Defaults to negotiated value.
            serverMaxWindowBits: 10, // Defaults to negotiated value.
            // Below options specified as default values.
            concurrencyLimit: 10, // Limits zlib concurrency for perf.
            threshold: 1024 // Size (in bytes) below which messages
            // should not be compressed.
        }
    }, new DefaultWSManager());
    const socketServer: DefaultSocketServer = new SocketServer(new DefaultSocketManager());

    await PlatformServer.init({httpServer, wsServer, socketServer});

    wsServer.addHandler(new DefaultWSHandler());

    socketServer.addHandler(new DefaultSocketHandler());

    httpServer.addHandler(new ExpressService());
    httpServer.addHandler(new PassportService());
    httpServer.addHandler(new AuthService());
    httpServer.addHandler(new PointService());
    httpServer.addHandler(new ModelService());
    httpServer.addHandler(new WSService());
    httpServer.addHandler(new RegionService());

    await PlatformServer.start();
}();