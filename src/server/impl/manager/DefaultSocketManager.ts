import SocketManager from '../../manager/SocketManager';
import {DefaultSocket, TerminalResizeOption} from '../../../types/chameleon-platform';
import * as fs from 'fs';
import * as stream from 'stream';
import {SocketMessageType} from '../../../types/chameleon-platform.enum';
import * as streams from 'memory-streams';
import {History} from '../../../entities/History';

export default class DefaultSocketManager extends SocketManager {
    sendHello(sockets: DefaultSocket[] = this.getAllSockets()) {
        this.json({msg: SocketMessageType.HELLO}, sockets);
    }

    getAllSockets() {
        return this.server?.sockets as DefaultSocket[];
    }

    getHistorySockets(history: History) {
        return this.server?.sockets.filter(s => s.data.history.id === history.id);
    }

    json(data: any, sockets: DefaultSocket[] = this.getAllSockets()) {
        sockets.forEach(s => s.write(JSON.stringify(data) + '\0'));
    }

    sendLaunchModel(scriptPath: string, options: any, sockets: DefaultSocket[] = this.getAllSockets()) {
        this.json({msg: SocketMessageType.LAUNCH_MODEL, scriptPath, options}, sockets);
    }

    async sendFile(socket: DefaultSocket, localPath: string, filePath: string) {
        const fileSize = fs.statSync(localPath).size;
        this.json({msg: SocketMessageType.FILE, filePath, fileSize}, [socket]);
        socket.data.readStream = fs.createReadStream(localPath);
        await new Promise(resolve => socket.data.fileSendResolver = resolve);
    }

    async sendTextAsFile(socket: DefaultSocket, text: string, filePath: string) {
        const fileSize = Buffer.byteLength(text, 'utf8');
        this.json({msg: SocketMessageType.FILE, filePath, fileSize}, [socket]);
        socket.data.readStream = stream.Readable.from([text]);
        await new Promise(resolve => socket.data.fileSendResolver = resolve);
    }

    async getFile(socket: DefaultSocket, localPath: string, remotePath: string) {
        socket.data.writeStream = fs.createWriteStream(localPath);
        this.json({msg: SocketMessageType.REQUEST_FILE, filePath: remotePath}, [socket]);
        await new Promise(resolve => socket.data.fileReceiveResolver = resolve);
    }

    async getFileAsText(socket: DefaultSocket, remotePath: string) {
        socket.data.writeStream = new streams.WritableStream();
        this.json({msg: SocketMessageType.REQUEST_FILE, filePath: remotePath}, [socket]);
        await new Promise(resolve => socket.data.fileReceiveResolver = resolve);
        return socket.data.writeStream.toString();
    }

    sendTerminalResize(resizeOptions: TerminalResizeOption, sockets: DefaultSocket[] = this.getAllSockets()) {
        this.json({msg: SocketMessageType.TERMINAL_RESIZE, ...resizeOptions}, sockets);
    }
}