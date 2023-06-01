import SocketManager from '../../manager/SocketManager';
import {
    LaunchOptions,
    SocketExitMessage,
    SocketFileMessage,
    SocketLaunchModelMessage,
    SocketMessageType,
    SocketRequestFileMessage,
    SocketTerminalBufferMessage,
    SocketTerminalResizeMessage,
    TerminalSizeOptions
} from '../../../types/chameleon-platform.common';
import * as fs from 'fs';
import * as stream from 'stream';
import * as streams from 'memory-streams';
import {History} from '../../../entities/History';
import {DefaultSocket} from '../../../types/chameleon-platform';

export default class DefaultSocketManager extends SocketManager {
    getAllSockets() {
        return this.server?.sockets as DefaultSocket[];
    }

    getHistorySockets(history: History) {
        return this.server?.sockets.filter(s => s.data.history.id === history.id);
    }

    getHistoryMainSocket(history: History) {
        return this.getHistorySockets(history).filter(s => s.data.isMainConnection).pop();
    }

    getExecutorSocket(history: History) {
        return this.getHistorySockets(history.parent).filter(s => s.data?.executedHistory && s.data.executedHistory.id === history.id).pop();
    }

    json(data: any, sockets: DefaultSocket[] = this.getAllSockets()) {
        sockets.forEach(s => s.write(JSON.stringify(data) + '\0'));
    }

    sendLaunchModel(scriptPath: string, options: LaunchOptions, sockets: DefaultSocket[] = this.getAllSockets()) {
        this.json({msg: SocketMessageType.LAUNCH_MODEL, scriptPath, options} as SocketLaunchModelMessage, sockets);
    }

    async sendFile(socket: DefaultSocket, localPath: string, filePath: string) {
        const fileSize = fs.statSync(localPath).size;
        this.json({msg: SocketMessageType.FILE, filePath, fileSize} as SocketFileMessage, [socket]);
        if (fileSize > 0) {
            socket.data.readStream = fs.createReadStream(localPath);
        }
        await new Promise(resolve => socket.data.fileSendResolver = resolve);
    }

    async sendTextAsFile(socket: DefaultSocket, text: string, filePath: string) {
        const fileSize = Buffer.byteLength(text, 'utf8');
        this.json({msg: SocketMessageType.FILE, filePath, fileSize} as SocketFileMessage, [socket]);
        if (fileSize > 0) {
            socket.data.readStream = stream.Readable.from([text]);
        }
        await new Promise(resolve => socket.data.fileSendResolver = resolve);
    }

    async getFile(socket: DefaultSocket, localPath: string, remotePath: string) {
        socket.data.localSavePath = localPath;
        socket.data.writeStream = fs.createWriteStream(localPath);
        this.json({msg: SocketMessageType.REQUEST_FILE, filePath: remotePath} as SocketRequestFileMessage, [socket]);
        await new Promise(resolve => socket.data.fileReceiveResolver = resolve);
    }

    async getFileAsText(socket: DefaultSocket, remotePath: string) {
        socket.data.writeStream = new streams.WritableStream();
        this.json({msg: SocketMessageType.REQUEST_FILE, filePath: remotePath} as SocketRequestFileMessage, [socket]);
        await new Promise(resolve => socket.data.fileReceiveResolver = resolve);
        return socket.data.writeStream.toString();
    }

    sendTerminalResize(terminalSizeOptions: TerminalSizeOptions, sockets: DefaultSocket[] = this.getAllSockets()) {
        this.json({msg: SocketMessageType.TERMINAL_RESIZE, ...terminalSizeOptions} as SocketTerminalResizeMessage, sockets);
    }

    sendExit(code: number, message?: string, sockets: DefaultSocket[] = this.getAllSockets()) {
        this.json({msg: SocketMessageType.EXIT, code, message} as SocketExitMessage, sockets);
    }

    sendTerminalBuffer(data: string, sockets: DefaultSocket[] = this.getAllSockets()) {
        this.json({msg: SocketMessageType.TERMINAL_BUFFER, data} as SocketTerminalBufferMessage, sockets);
    }
}