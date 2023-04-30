import {RawData, WebSocket} from 'ws';
import {Socket} from 'net';
import SocketServer from '../server/SocketServer';
import WSServer from '../server/WSServer';
import DefaultSocketManager from '../server/impl/manager/DefaultSocketManager';
import DefaultWSManager from '../server/impl/manager/DefaultWSManager';
import * as express from 'express';
import {Application} from 'express';
import {Server} from 'http';
import {MysqlConnectionOptions} from "typeorm/driver/mysql/MysqlConnectionOptions";

export type ISocket = Socket & { id: string };
export type IWSocket = WebSocket & { id: string, req: any };

export interface HTTPService {
    router: express.Router
}

export interface HTTPHandler {
    init: (app: Application, server: Server) => void,
}

export interface SocketHandler<Server, Socket> {
    onReady?: (server: Server, socket: Socket) => void,
    onData?: (server: Server, socket: Socket, data: Buffer) => void,
    onClose?: (server: Server, socket: Socket, hadError: boolean) => void,
}

export interface WebSocketHandler<Server, Socket> {
    onReady?: (server: Server, socket: Socket) => void,
    onMessage?: (server: Server, socket: Socket, message: RawData, isBinary: boolean) => void,
    onClose?: (server: Server, socket: Socket, code: number, reason: Buffer) => void,
}

export type DefaultSocketServer = SocketServer<DefaultSocketData, DefaultSocketManager>;
export type DefaultSocketData = {
    /* empty */
};
export type DefaultSocket = ISocket & { data: DefaultSocketData };

export type DefaultWSServer = WSServer<DefaultWSData, DefaultWSManager>;
export type DefaultWSData = {
    /* empty */
};
export type DefaultWSocket = IWSocket & { data: DefaultWSData };

export type PlatformConfig = {
    /* empty */
    dockerServers: { host: string, port: number }[];
    defaultDockerServer: string;
    socketExternalHost: string;
    socketExternalPort: number;
    sessionSecret: string;
    controllerPath: string;
    socketPort: number;
    httpPort: number;
    db: MysqlConnectionOptions;
};


export type ModelParameters = {
    uischema: any;
    schema: any;
}

export type ModelConfig = {
    paths: {
        script: string;
        input: string;
        inputInfo: string;
        output: string;
        outputInfo: string;
        outputDescription: string;
        controllerPath: string;
        debugLog: string;
    }
}