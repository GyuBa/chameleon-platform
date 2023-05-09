import {RawData, WebSocket} from 'ws';
import {Socket} from 'net';
import SocketServer from '../server/SocketServer';
import WSServer from '../server/WSServer';
import DefaultSocketManager from '../server/impl/manager/DefaultSocketManager';
import DefaultWSManager from '../server/impl/manager/DefaultWSManager';
import * as express from 'express';
import {Application} from 'express';
import {Server} from 'http';
import {MysqlConnectionOptions} from 'typeorm/driver/mysql/MysqlConnectionOptions';
import * as stream from 'stream';
import {Terminal} from 'xterm-headless';
import {SerializeAddon} from 'xterm-addon-serialize';
import {History} from '../entities/History';
import {SocketReceiveMode} from "./chameleon-platform.common";

export type Resolver = (value?: unknown) => void;
type ReadStreamClose = (callback?: (err?: NodeJS.ErrnoException | null) => void) => void;
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
    terminalBuffer: string;
    terminalBufferingLock: boolean;
    terminalDatabaseLock: boolean;
    buffer: string;
    receiveMode: SocketReceiveMode;
    receivedBytes: number;
    fileSize: number;
    writeStream: stream.Writable;
    readStream: stream.Readable & { close?: ReadStreamClose };
    fileReceiveResolver: Resolver;
    fileSendResolver: Resolver;
    history: History;
    terminal: Terminal;
    terminalSerializer: SerializeAddon;
};
export type DefaultSocket = ISocket & { data: DefaultSocketData };

export type DefaultWSServer = WSServer<DefaultWSData, DefaultWSManager>;
export type DefaultWSData = {
    path: string;
};
export type DefaultWSocket = IWSocket & { data: DefaultWSData };

export type PlatformConfig = {
    dockerServers: { host: string, port: number }[];
    defaultDockerServer: string;
    socketExternalHost: string;
    socketExternalPort: number;
    sessionSecret: string;
    controllerPath: string;
    dependenciesPath: string;
    socketPort: number;
    httpPort: number;
    db: MysqlConnectionOptions;
};

export type SocketHandle = (client: DefaultSocketServer, socket: DefaultSocket, message: any) => void;
export type WebSocketHandle = (server: DefaultWSServer, socket: DefaultWSocket, data: any) => void;
