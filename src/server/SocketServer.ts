import * as net from 'net';
import {Server, Socket, SocketAddress} from 'net';
import {v4 as uuidv4} from 'uuid';
import SocketManager from './manager/SocketManager';
import {ISocket, SocketHandler} from '../types/chameleon-platform';

export default class SocketServer<SocketData, Manager extends SocketManager> {
    readonly server: Server;
    readonly manager: Manager;
    readonly sockets: (ISocket & { data: SocketData })[] = [];
    readonly socketsMap: { [id: string]: ISocket & { data: SocketData } } = {};
    readonly handlers: SocketHandler<any, any>[] = [];

    constructor(manager: Manager) {
        this.server = net.createServer(((socket: ISocket & { data: SocketData }) => {
            socket.id = uuidv4();
            socket.data = {} as SocketData;
            this.socketsMap[socket.id] = socket;
            this.sockets.push(socket);

            console.log(`SocketServer: ${socket.remoteAddress} connected.`);

            this.handlers.forEach(h => h.onReady?.(this, socket));

            socket.on('data', (data: Buffer) => {
                this.handlers.forEach(h => h.onData?.(this, socket, data));
            });

            socket.on('error', (err: Error) => {
                socket.destroy();
            });

            socket.on('close', (hadError: boolean) => {
                this.handlers.forEach(h => h.onClose?.(this, socket, hadError));
                this.sockets.splice(this.sockets.indexOf(socket), 1);
                delete this.socketsMap[socket.id];
            });
        }) as (socket: Socket) => void);

        this.server.on('error', function (err) {
            console.error('SocketServer Error:' + err);
        });

        this.manager = manager;
        this.manager.init(this);
    }

    addHandler(handler: SocketHandler<any, any>) {
        this.handlers.push(handler);
    }

    removeHandler(handler: SocketHandler<any, any>) {
        const index = this.handlers.indexOf(handler);
        if (index > -1) {
            this.handlers.splice(index, 1);
        }
    }

    listen(port: number) {
        this.server.listen(port, function () {
            console.log(`SocketServer: Listening on ${port}.`);
        });
    }

    close() {
        this.server.close(() => {
            console.log('SocketServer closed.');
        });
    }
}