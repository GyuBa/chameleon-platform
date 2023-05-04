import {DefaultSocket, DefaultSocketServer, SocketHandle, SocketHandler} from '../../../types/chameleon-platform';
import {PlatformService} from '../../../service/interfaces/PlatformService';
import * as streams from 'memory-streams';
import {HistoryStatus, SocketMessageType, SocketReceiveMode} from '../../../types/chameleon-platform.enum';
import {Terminal} from 'xterm-headless';
import {SerializeAddon} from 'xterm-addon-serialize';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as Dockerode from 'dockerode';
import PlatformServer from '../../core/PlatformServer';

export default class DefaultSocketHandler extends PlatformService implements SocketHandler<DefaultSocketServer, DefaultSocket> {
    readonly handles: { [messageType: string]: SocketHandle } = {};

    constructor() {
        super();

        this.handles[SocketMessageType.LAUNCH] = async (server: DefaultSocketServer, socket: DefaultSocket, message: any) => {
            const history = socket.data.history = await this.historyController.findById(message.historyId);
            const model = history.model;
            const config = model.config;
            const paths = config.paths;

            console.log(`[Socket, ${socket.remoteAddress}:${socket.remotePort}] (History: ${history.id}) Launch - Model: ${model.name}, Executor: ${socket.data.history.executor.username}, Image: ${model.image.getRepositoryTagString()}, Container: ${history.containerId}`);

            console.log(`[Socket, ${socket.remoteAddress}:${socket.remotePort}] (History: ${history.id}) SendFile (Input) - InputPath: ${history.inputPath}, FileSize: ${fs.statSync(history.inputPath).size}`);
            await server.manager.sendFile(socket, history.inputPath, config.paths.input);
            const inputInfo = JSON.stringify(history.inputInfo);
            console.log(`[Socket, ${socket.remoteAddress}:${socket.remotePort}] (History: ${history.id}) SendTextAsFile (InputInfo) - Length: ${inputInfo.length}`);
            await server.manager.sendTextAsFile(socket, inputInfo, paths.inputInfo);
            const parameters = JSON.stringify(history.parameters);
            console.log(`[Socket, ${socket.remoteAddress}:${socket.remotePort}] (History: ${history.id}) SendTextAsFile (Parameters) - Length: ${parameters.length}`);
            await server.manager.sendTextAsFile(socket, parameters, paths.parameters);

            socket.data.terminal = new Terminal({allowProposedApi: true});
            socket.data.terminalSerializer = new SerializeAddon();
            socket.data.terminal.loadAddon(socket.data.terminalSerializer);

            console.log(`[Socket, ${socket.remoteAddress}:${socket.remotePort}] (History: ${history.id}) SendLaunchModel`);
            server.manager.sendLaunchModel(paths.script, {cols: 181, row: 14}, [socket]);
        };

        this.handles[SocketMessageType.FILE_WAIT] = (server: DefaultSocketServer, socket: DefaultSocket, message: any) => {
            socket.data.readStream.pipe(socket, {end: false});
            socket.data.readStream.on('end', () => {
                socket.data.readStream?.close?.();
            });
        };

        this.handles[SocketMessageType.FILE_RECEIVE_END] = (server: DefaultSocketServer, socket: DefaultSocket, message: any) => {
            socket.data.fileSendResolver();
        };

        this.handles[SocketMessageType.FILE] = (server: DefaultSocketServer, socket: DefaultSocket, message: any) => {
            socket.data.fileSize = message.fileSize;
            if (socket.data.fileSize === 0) {
                server.manager.json({msg: SocketMessageType.FILE_RECEIVE_END}, [socket]);
                socket.data.fileReceiveResolver();
                return;
            }
            socket.data.receiveMode = SocketReceiveMode.FILE;
            socket.data.receivedBytes = 0;
            server.manager.json({msg: SocketMessageType.WAIT_RECEIVE}, [socket]);
        };

        this.handles[SocketMessageType.TERMINAL] = (server: DefaultSocketServer, socket: DefaultSocket, message: any) => {
            socket.data.terminalBuffer += message.data;
            const history = socket.data.history;

            if (socket.data.terminalBufferingLock) {
                socket.data.terminalBufferingLock = true;
                setTimeout(() => {
                    socket.data.terminal.write(socket.data.terminalBuffer, () => {
                        history.terminal = socket.data.terminalSerializer.serialize();
                    });
                    const targetSockets = PlatformServer.wsServer.manager.getHistoryRelatedSockets(history);
                    PlatformServer.wsServer.manager.sendTerminal(socket.data.terminalBuffer, targetSockets);

                    socket.data.terminalBuffer = '';
                    socket.data.terminalBufferingLock = false;
                }, 100);
            }

            if (socket.data.terminalDatabaseLock) {
                socket.data.terminalDatabaseLock = true;
                setTimeout(async () => {
                    history.terminal = socket.data.terminalSerializer.serialize();
                    await this.historyController.save(history);
                    console.log(`[Socket, ${socket.remoteAddress}:${socket.remotePort}] (History: ${history.id}) Terminal (Saved) - Length: ${history.terminal.length}`);
                    socket.data.terminalDatabaseLock = false;
                }, 1000);
            }
        };


        this.handles[SocketMessageType.PROCESS_END] = async (server: DefaultSocketServer, socket: DefaultSocket, message: any) => {
            const history = socket.data.history;
            console.log(`[Socket, ${socket.remoteAddress}:${socket.remotePort}] (History: ${history.id}) ProcessEnd`);

            history.outputPath = `uploads/outputs/${crypto.randomBytes(16).toString('hex')}`;
            const model = history.model;
            const image = model.image;
            const {paths} = history.model.config;
            const inputInfo = history.inputInfo;

            console.log(`[Socket, ${socket.remoteAddress}:${socket.remotePort}] (History: ${history.id}) GetFile (Output) - ${history.outputPath}`);
            await server.manager.getFile(socket, history.outputPath, paths.output);
            console.log(`[Socket, ${socket.remoteAddress}:${socket.remotePort}] (History: ${history.id}) GetFileAsText (OutputDescription)`);
            history.description = await server.manager.getFileAsText(socket, paths.outputDescription);
            console.log(`[Socket, ${socket.remoteAddress}:${socket.remotePort}] (History: ${history.id}) GetFileAsText (OutputInfo)`);
            const outputInfoRaw = await server.manager.getFileAsText(socket, paths.outputInfo);

            let outputInfo: any = {};
            try {
                outputInfo = JSON.parse(outputInfoRaw);
            } catch (e) {
                /* empty */
            }
            outputInfo.fileSize = fs.existsSync(history.outputPath) ? fs.statSync(history.outputPath).size : 0;
            outputInfo.fileName = outputInfo.fileName ? outputInfo.fileName : `output_${inputInfo.originalName}}`;
            history.outputInfo = outputInfo;
            history.status = HistoryStatus.FINISHED;
            await this.historyController.save(history);
            // TODO: TIMING - FINISHED
            const targetSockets = PlatformServer.wsServer.manager.getHistoryRelatedSockets(history, PlatformServer.wsServer.manager.getAuthenticatedSockets());
            PlatformServer.wsServer.manager.sendUpdateHistory(history, targetSockets);

            console.log(`[Socket, ${socket.remoteAddress}:${socket.remotePort}] (History: ${history.id}) ClearContainer - Container: ${history.containerId}`);
            const docker = new Dockerode(image.region);
            const container = await docker.getContainer(history.containerId);
            await container.stop();
            await container.remove();
        };
    }

    onReady(server: DefaultSocketServer, socket: DefaultSocket) {
        socket.data.buffer = '';
        socket.data.terminalBuffer = '';
        socket.data.terminalBufferingLock = false;
        socket.data.receiveMode = SocketReceiveMode.JSON;
    }

    onData(server: DefaultSocketServer, socket: DefaultSocket, data: Buffer) {
        if (socket.data.receiveMode === SocketReceiveMode.JSON) {
            const dataString = socket.data.buffer + data.toString();
            const splitString = dataString.split('\0').filter(s => s.length > 0);
            const lastMessageString = splitString.pop();
            for (const split of splitString) {
                let message;
                try {
                    message = JSON.parse(split);
                } catch (e) {
                    console.error(e);
                    console.error(`split.length=${split.length}, split=${split}`);
                    console.error(`dataString.length=${dataString.length}, dataString=${dataString}`);
                }
                this.handles[message.msg](server, socket, message);
            }
            let message;
            try {
                message = JSON.parse(lastMessageString);
                socket.data.buffer = '';
            } catch (e) {
                if (lastMessageString !== undefined) {
                    socket.data.buffer = lastMessageString;
                }
            }
            if (message) {
                try {
                    this.handles[message.msg](server, socket, message);
                } catch (e) {
                    console.error(`[Socket, ${socket.remoteAddress}:${socket.remotePort}] onData - Message: ${JSON.stringify(message)}`);
                }
            }
        } else {
            socket.data.receivedBytes += data.length;
            if (socket.data.receivedBytes >= socket.data.fileSize) {
                const delta = socket.data.receivedBytes - socket.data.fileSize;
                const fileBytes = data.length - delta;
                const fileData = data.subarray(0, fileBytes);
                const bufferData = data.subarray(fileBytes + 1, data.length);
                socket.data.buffer = bufferData.toString();
                if (socket.data.writeStream instanceof streams.WritableStream) {
                    socket.data.writeStream?.destroy?.();
                    socket.data.writeStream.write(fileData);
                    socket.data.receiveMode = SocketReceiveMode.JSON;
                    server.manager.json({msg: SocketMessageType.FILE_RECEIVE_END}, [socket]);
                    socket.data.fileReceiveResolver();
                } else {
                    socket.data.writeStream.write(fileData, function () {
                        socket.data.writeStream?.destroy?.();
                        socket.data.receiveMode = SocketReceiveMode.JSON;
                        server.manager.json({msg: SocketMessageType.FILE_RECEIVE_END}, [socket]);
                        socket.data.fileReceiveResolver();
                    });
                }
            } else {
                socket.data.writeStream.write(data);
            }
        }
    }

    onClose(server: DefaultSocketServer, socket: DefaultSocket, hadError: boolean) {
        /* empty */
    }
}

