import {DefaultSocket, DefaultSocketServer, SocketHandler} from '../../../types/chameleon-platform';
import {PlatformService} from '../../../service/interfaces/PlatformService';
import * as streams from 'memory-streams';
import {SocketMessageType, SocketReceiveMode} from "../../../types/chameleon-platform.enum";
import {Terminal} from "xterm-headless";

type Handle = (client: DefaultSocketServer, socket: DefaultSocket, message: any) => void;
const handles: { [messageType: string]: Handle } = {};

handles[SocketMessageType.Launch] = (server: DefaultSocketServer, socket: DefaultSocket, message: any) => {
    console.log(message.historyId);
    /*socket.data.modelPath = message.modelPath;
    const model = Model.getModel(socket.data.modelPath);
    const history = model.lastHistory;
    (async () => {
        let paths = PathsUtils.getPaths(model.config.input.paths);
        await server.manager.sendFile(socket, history.inputPath as string, paths.input as string);
        await server.manager.sendTextAsFile(socket, JSON.stringify({
            inputInfo: history.inputInfo,
            parameters: history.parameters
        }), paths.inputInfo as string);
        socket.data.terminal = new Terminal({allowProposedApi: true});
        socket.data.terminalSerializer = new SerializeAddon();
        socket.data.terminal.loadAddon(socket.data.terminalSerializer);
        server.manager.sendLaunchModel(paths.script as string, [socket]);
    })();*/
};

handles[SocketMessageType.FileWait] = (server: DefaultSocketServer, socket: DefaultSocket, message: any) => {
    socket.data.readStream.pipe(socket, {end: false});
    socket.data.readStream.on('end', () => {
        socket.data.readStream?.close?.();
    });
};

handles[SocketMessageType.FileReceiveEnd] = (server: DefaultSocketServer, socket: DefaultSocket, message: any) => {
    socket.data.fileSendResolver();
};

/*handles[SocketMessageType.Terminal] = (server: DefaultSocketServer, socket: DefaultSocket, message: any) => {
    socket.data.terminalBuffer += message.data;
    if (socket.data.waitTerminalFlushTimeout) {
        return;
    }
    socket.data.waitTerminalFlushTimeout = true;
    setTimeout(() => {
        let model = Model.getModel(socket.data.modelPath);
        let history = model.lastHistory;
        socket.data.terminal.write(socket.data.terminalBuffer, () => {
            history.terminal = socket.data.terminalSerializer.serialize();
            model.lastHistory = history;
        });
        let sockets = PlatformServer.wsServer.manager.getModelSockets(model);
        PlatformServer.wsServer.manager.sendTerminal(socket.data.terminalBuffer, sockets);
        // console.log('Buffer flushed:', socket.data.terminalBuffer.length);
        socket.data.terminalBuffer = '';
        socket.data.waitTerminalFlushTimeout = false;
    }, 100);
}*/

/*handles[SocketMessageType.ProcessEnd] = (server: DefaultSocketServer, socket: DefaultSocket, message: any) => {
    let model = Model.getModel(socket.data.modelPath);
    let history = model.lastHistory;
    // WARNING: multer와 같은 hash 기반 이름으로 통일
    history.outputPath = 'resources/' + uuid();
    (async () => {
        let config = model.config;
        let docker = new Docker(PlatformServer.getDockerServer(config.dockerServer));
        let {container, containerInfo} = await DockerUtils.getContainerByName(docker, config.container);
        let paths = PathsUtils.getPaths(config.input.paths);
        // await DockerUtils.exec(container, `touch "${paths.outputDescription}"`);
        // await DockerUtils.exec(container, `touch "${paths.outputInfo}"`);
        // await DockerUtils.exec(container, `touch "${paths.output}"`);
        // await DockerUtils.exec(container, `rm -rf "${paths.controllerPath}/controller"`);
        await server.manager.getFile(socket, history.outputPath as string, paths.output as string);
        history.description = await server.manager.getFileAsText(socket, paths.outputDescription as string);
        history.outputInfo = {};
        let fileSize = fs.existsSync(history.outputPath as string) ? fs.statSync(history.outputPath as string).size : 0;
        let outputInfo = await server.manager.getFileAsText(socket, paths.outputInfo as string);
        try {
            history.outputInfo = JSON.parse(outputInfo);
        } catch (e) {

        }
        history.outputInfo.fileSize = fileSize;
        if (!history.outputInfo.fileName) {
            history.outputInfo.fileName = 'output_' + history.inputInfo.originalName;
        }
        model.lastHistory = history;
        PlatformServer.wsServer.manager.sendUpdateHistory(model.lastHistory, PlatformServer.wsServer.manager.getHistorySockets(model.lastHistory));

        PlatformServer.wsServer.manager.sendUpdateModel(model, PlatformServer.wsServer.manager.getModelSockets(model));
        PlatformServer.wsServer.manager.sendUpdateHistories();

        let modelData = model.data;
        modelData.status = ModelStatus.UNDEPLOYING;
        model.data = modelData;
        PlatformServer.wsServer.manager.sendUpdateModel(model, PlatformServer.wsServer.manager.getModelSockets(model));
        PlatformServer.wsServer.manager.sendUpdateModels();
        PlatformServer.wsServer.manager.sendUpdateHistories();

        // WARNING: stop 전에 모든 데이터 삭제
        await container.stop();

        modelData.status = ModelStatus.OFF;
        model.data = modelData;
        PlatformServer.wsServer.manager.sendUpdateModel(model, PlatformServer.wsServer.manager.getModelSockets(model));
        PlatformServer.wsServer.manager.sendUpdateModels();
        PlatformServer.wsServer.manager.sendUpdateHistory(history);
        PlatformServer.wsServer.manager.sendUpdateHistories();
    })();
}*/

handles[SocketMessageType.File] = (server: DefaultSocketServer, socket: DefaultSocket, message: any) => {
    socket.data.fileSize = message.fileSize;
    if (socket.data.fileSize === 0) {
        server.manager.json({msg: SocketMessageType.FileReceiveEnd}, [socket]);
        socket.data.fileReceiveResolver();
        return;
    }
    socket.data.receiveMode = SocketReceiveMode.FILE;
    socket.data.receivedBytes = 0;
    server.manager.json({msg: SocketMessageType.WaitReceive}, [socket]);
};

export default class DefaultSocketHandler extends PlatformService implements SocketHandler<DefaultSocketServer, DefaultSocket> {
    onReady(server: DefaultSocketServer, socket: DefaultSocket) {
        socket.data.buffer = '';
        socket.data.terminalBuffer = '';
        socket.data.waitTerminalFlushTimeout = false;
        socket.data.receiveMode = SocketReceiveMode.JSON;
    }

    onData(server: DefaultSocketServer, socket: DefaultSocket, data: Buffer) {
        if (socket.data.receiveMode === SocketReceiveMode.JSON) {
            const dataString = socket.data.buffer + data.toString();
            const splitString = dataString.split('\0').filter(s => s.length > 0);
            const lastMessageString = splitString.pop() as string;
            for (const split of splitString) {
                let message;
                try {
                    message = JSON.parse(split);
                } catch (e) {
                    console.error(e);
                    console.error(`split.length=${split.length}, dataString.length=${dataString.length}`);
                    console.error(`split=${JSON.stringify(split)}, dataString=${JSON.stringify(dataString)}`);
                }
                handles[message.msg](server, socket, message);
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
                handles[message.msg](server, socket, message);
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
                    server.manager.json({msg: SocketMessageType.FileReceiveEnd}, [socket]);
                    socket.data.fileReceiveResolver();
                } else {
                    socket.data.writeStream.write(fileData, function () {
                        socket.data.writeStream?.destroy?.();
                        socket.data.receiveMode = SocketReceiveMode.JSON;
                        server.manager.json({msg: SocketMessageType.FileReceiveEnd}, [socket]);
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

