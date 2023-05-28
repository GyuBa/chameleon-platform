import {DefaultSocket, DefaultSocketServer, SocketHandle, SocketHandler} from '../../../types/chameleon-platform';
import {PlatformService} from '../../../service/interfaces/PlatformService';
import * as streams from 'memory-streams';
import {Terminal} from 'xterm-headless';
import {SerializeAddon} from 'xterm-addon-serialize';
import * as fs from 'fs';
import * as Dockerode from 'dockerode';
import PlatformServer from '../../core/PlatformServer';
import {
    HistoryStatus,
    PointHistoryType,
    SocketFileMessage,
    SocketFileReceiveEndMessage,
    SocketFileWaitMessage,
    SocketLaunchMessage,
    SocketMessageType,
    SocketProcessEndMessage,
    SocketReceiveMode,
    SocketTerminalMessage
} from '../../../types/chameleon-platform.common';
import {DateUtils} from '../../../utils/DateUtils';
import {MulterUtils} from '../../../utils/MulterUtils';
import {Model} from '../../../entities/Model';
import {PointHistory} from "../../../entities/PointHistory";
import {EarnedPointHistory} from "../../../entities/EarnedPointHistory";

export default class DefaultSocketHandler extends PlatformService implements SocketHandler<DefaultSocketServer, DefaultSocket> {
    readonly handles: { [messageType: string]: SocketHandle } = {};

    constructor() {
        super();

        this.handles[SocketMessageType.LAUNCH] = async (server: DefaultSocketServer, socket: DefaultSocket, message: SocketLaunchMessage) => {
            socket.data.isMainConnection = message.isMainConnection;
            socket.data.executionData = message.executionData;
            const history = socket.data.history = await this.historyController.findById(message.historyId);
            if (socket.data.isMainConnection) {
                const model = history.model;
                const config = model.config;
                const paths = config.paths;

                console.log(`[${DateUtils.getConsoleTime()} | Socket, ${socket.remoteAddress}] (History: ${history.id}) Launch - Model: ${model.name}, Executor: ${socket.data.history.executor.username}, Image: ${model.image.getRepositoryTagString()}, Container: ${history.containerId}`);

                console.log(`[${DateUtils.getConsoleTime()} | Socket, ${socket.remoteAddress}] (History: ${history.id}) SendFile (Input) - InputPath: ${history.inputPath}, FileSize: ${fs.statSync(history.inputPath).size}`);
                await server.manager.sendFile(socket, history.inputPath, config.paths.input);
                const inputInfo = JSON.stringify(history.inputInfo);
                console.log(`[${DateUtils.getConsoleTime()} | Socket, ${socket.remoteAddress}] (History: ${history.id}) SendTextAsFile (InputInfo) - Length: ${inputInfo.length}`);
                await server.manager.sendTextAsFile(socket, inputInfo, paths.inputInfo);
                const parameters = JSON.stringify(history.parameters);
                console.log(`[${DateUtils.getConsoleTime()} | Socket, ${socket.remoteAddress}] (History: ${history.id}) SendTextAsFile (Parameters) - Length: ${parameters.length}`);
                await server.manager.sendTextAsFile(socket, parameters, paths.parameters);

                socket.data.terminal = new Terminal({allowProposedApi: true});
                socket.data.terminalSerializer = new SerializeAddon();
                socket.data.terminal.loadAddon(socket.data.terminalSerializer);

                console.log(`[${DateUtils.getConsoleTime()} | Socket, ${socket.remoteAddress}] (History: ${history.id}) SendLaunchModel`);
                server.manager.sendLaunchModel(paths.script, {cols: 181, rows: 14}, [socket]);
            } else {
                if (!server.manager.getHistoryMainSocket(history)) {
                    server.manager.sendExit(1, 'The main connection is not running.', [socket]);
                    return;
                }
                const executionData = socket.data.executionData;
                console.log(`[${DateUtils.getConsoleTime()} | Socket, ${socket.remoteAddress}] (History: ${history.id} Sub) CLIExecution`);
                let model: Model;
                try {
                    model = await this.modelController.findByUsernameAndUniqueName(executionData.username, executionData.uniqueName);
                } catch (e) {
                    server.manager.sendExit(1, 'Wrong model id.', [socket]);
                    return;
                }

                if (!(executionData.inputPath && executionData.outputPath && executionData.parametersPath)) {
                    executionData.inputPath = model.config.paths.input;
                    executionData.parametersPath = model.config.paths.parameters;
                    executionData.outputPath = model.config.paths.output;
                }

                const inputPath = MulterUtils.getMulterLikeFilePath('uploads/inputs');
                await server.manager.getFile(socket, inputPath, executionData.inputPath);
                const rawParameters = await server.manager.getFileAsText(socket, executionData.parametersPath);
                let parameters;
                try {
                    parameters = JSON.parse(rawParameters);
                } catch (e) {
                    server.manager.sendExit(1, 'Wrong parameters.', [socket]);
                    return;
                }
                const pointHistory = new PointHistory();
                const isPaidCase = model.price > 0 && model.register.id !== history.executor.id;
                if (isPaidCase) {
                    const executor = await this.userController.findById(history.executor.id);
                    const register = model.register;
                    if (executor.point - model.price < 0) {
                        server.manager.sendExit(1, 'Not enough points to use.', [socket]);
                        return;
                    }
                    executor.point -= model.price;
                    register.earnedPoint += model.price;

                    pointHistory.delta = -model.price;
                    pointHistory.leftPoint = executor.point;
                    pointHistory.user = executor;
                    pointHistory.type = PointHistoryType.USE_PAID_MODEL;

                    const earnedPointHistory = new EarnedPointHistory();
                    earnedPointHistory.delta = model.price;
                    earnedPointHistory.leftEarnedPoint = register.earnedPoint;
                    earnedPointHistory.model = model;
                    earnedPointHistory.user = register;
                    earnedPointHistory.executor = executor;
                    await this.earnedPointHistoryController.save(earnedPointHistory);

                    await this.userController.save(executor);
                    await this.userController.save(register);
                }

                socket.data.executedHistory = await this.modelExecutionManager.executeModel(model, {
                    executor: history.executor, inputPath, parameters, inputInfo: {
                        fileSize: fs.statSync(inputPath).size,
                        fileName: 'input'
                    }, parent: history
                });

                if (isPaidCase) {
                    pointHistory.modelHistory = socket.data.executedHistory;
                    await this.pointHistoryController.save(pointHistory);
                }

                console.log(`[${DateUtils.getConsoleTime()} | Socket, ${socket.remoteAddress}] (History: ${history.id} Sub) ExecutedHistory: ${socket.data.executedHistory.id}, NumberOfParents: ${socket.data.executedHistory.numberOfParents}`);
            }
        };

        this.handles[SocketMessageType.FILE_WAIT] = (server: DefaultSocketServer, socket: DefaultSocket, message: SocketFileWaitMessage) => {
            socket.data.readStream.pipe(socket, {end: false});
            socket.data.readStream.on('end', () => {
                socket.data.readStream?.close?.();
            });
        };

        this.handles[SocketMessageType.FILE_RECEIVE_END] = (server: DefaultSocketServer, socket: DefaultSocket, message: SocketFileReceiveEndMessage) => {
            socket.data.fileSendResolver();
        };

        this.handles[SocketMessageType.FILE] = (server: DefaultSocketServer, socket: DefaultSocket, message: SocketFileMessage) => {
            socket.data.fileSize = message.fileSize;
            if (socket.data.fileSize === 0) {
                if (!(socket.data.writeStream instanceof streams.WritableStream)) {
                    fs.closeSync(fs.openSync(socket.data.localSavePath, 'w'));
                }
                socket.data.writeStream?.destroy?.();
                server.manager.json({msg: SocketMessageType.FILE_RECEIVE_END}, [socket]);
                socket.data.fileReceiveResolver();
                return;
            }
            socket.data.receiveMode = SocketReceiveMode.FILE;
            socket.data.receivedBytes = 0;
            server.manager.json({msg: SocketMessageType.WAIT_RECEIVE}, [socket]);
        };

        this.handles[SocketMessageType.TERMINAL] = (server: DefaultSocketServer, socket: DefaultSocket, message: SocketTerminalMessage) => {
            socket.data.terminalBuffer += message.data;
            const history = socket.data.history;

            if (!socket.data.terminalBufferingLock) {
                socket.data.terminalBufferingLock = true;
                setTimeout(() => {
                    socket.data.terminal.write(socket.data.terminalBuffer, () => {
                        history.terminal = socket.data.terminalSerializer.serialize();
                    });
                    const targetSockets = PlatformServer.wsServer.manager.getHistoryRelatedSockets(history);
                    PlatformServer.wsServer.manager.sendTerminal(socket.data.terminalBuffer, targetSockets);
                    if (history.parent) {
                        server.manager.sendTerminal(socket.data.terminalBuffer, [server.manager.getExecutorSocket(history)]);
                    }

                    socket.data.terminalBuffer = '';
                    socket.data.terminalBufferingLock = false;
                }, 100);
            }

            if (!socket.data.terminalDatabaseLock) {
                socket.data.terminalDatabaseLock = true;
                setTimeout(async () => {
                    history.terminal = socket.data.terminalSerializer.serialize();
                    await this.historyController.save(history);
                    console.log(`[${DateUtils.getConsoleTime()} | Socket, ${socket.remoteAddress}] (History: ${history.id}) Terminal (Saved) - Length: ${history.terminal.length}`);
                    socket.data.terminalDatabaseLock = false;
                }, 1000);
            }
        };


        this.handles[SocketMessageType.PROCESS_END] = async (server: DefaultSocketServer, socket: DefaultSocket, message: SocketProcessEndMessage) => {
            const history = socket.data.history;
            console.log(`[${DateUtils.getConsoleTime()} | Socket, ${socket.remoteAddress}] (History: ${history.id}) ProcessEnd`);
            history.outputPath = MulterUtils.getMulterLikeFilePath('uploads/outputs');

            const model = history.model;
            const image = model.image;
            const {paths} = history.model.config;
            const inputInfo = history.inputInfo;

            console.log(`[${DateUtils.getConsoleTime()} | Socket, ${socket.remoteAddress}] (History: ${history.id}) GetFile (Output) - ${history.outputPath}`);
            await server.manager.getFile(socket, history.outputPath, paths.output);
            console.log(`[${DateUtils.getConsoleTime()} | Socket, ${socket.remoteAddress}] (History: ${history.id}) GetFileAsText (OutputDescription)`);
            history.description = await server.manager.getFileAsText(socket, paths.outputDescription);
            console.log(`[${DateUtils.getConsoleTime()} | Socket, ${socket.remoteAddress}] (History: ${history.id}) GetFileAsText (OutputInfo)`);
            const outputInfoRaw = await server.manager.getFileAsText(socket, paths.outputInfo);

            let outputInfo: any = {};
            try {
                outputInfo = JSON.parse(outputInfoRaw);
            } catch (e) {
                /* empty */
            }
            outputInfo.fileSize = fs.existsSync(history.outputPath) ? fs.statSync(history.outputPath).size : 0;
            outputInfo.fileName = outputInfo.fileName ? outputInfo.fileName : `output_${inputInfo.fileName}`;
            history.outputInfo = outputInfo;
            history.status = HistoryStatus.FINISHED;
            history.endedTime = new Date();
            await this.historyController.save(history);
            // TODO: TIMING - FINISHED
            const targetSockets = PlatformServer.wsServer.manager.getHistoryRelatedSockets(history, PlatformServer.wsServer.manager.getAuthenticatedSockets());
            PlatformServer.wsServer.manager.sendUpdateHistory(history, targetSockets);
            if (history.parent) {
                const executorSocket = server.manager.getExecutorSocket(history);
                await server.manager.sendFile(executorSocket, history.outputPath, executorSocket.data.executionData.outputPath);
                await server.manager.sendExit(0);
            }

            console.log(`[${DateUtils.getConsoleTime()} | Socket, ${socket.remoteAddress}] (History: ${history.id}) ClearContainer - Container: ${history.containerId}`);
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
                try {
                    this.handles[message.msg](server, socket, message);
                } catch (e) {
                    console.error(`[${DateUtils.getConsoleTime()} | Socket, ${socket.remoteAddress}] onData - Message: ${JSON.stringify(message)}`);
                }
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
                    console.error(`[${DateUtils.getConsoleTime()} | Socket, ${socket.remoteAddress}] onData - Message: ${JSON.stringify(message)}`);
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

