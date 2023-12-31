import {RawData} from 'ws';
import {DefaultWSocket, DefaultWSServer, WebSocketHandle, WebSocketHandler} from '../../../types/chameleon-platform';
import {PlatformService} from '../../../service/interfaces/PlatformService';
import PlatformServer from '../../core/PlatformServer';
import {WSMessageType, WSPathMessage, WSTerminalResizeMessage} from '../../../types/chameleon-platform.common';
import {DateUtils} from '../../../utils/DateUtils';
import {User} from '../../../entities/User';


export default class DefaultWSHandler extends PlatformService implements WebSocketHandler<DefaultWSServer, DefaultWSocket> {
    readonly handles: { [messageType: string]: WebSocketHandle } = {};

    constructor() {
        super();

        this.handles[WSMessageType.PATH] = async (server: DefaultWSServer, socket: DefaultWSocket, data: WSPathMessage) => {
            console.log(`[${DateUtils.getConsoleTime()} | WebSocket, ${socket.req.ip}] Path - ${data.path}`);
            socket.data.path = data.path;
        };

        this.handles[WSMessageType.TERMINAL_RESIZE] = async (server: DefaultWSServer, socket: DefaultWSocket, data: WSTerminalResizeMessage) => {
            if (!socket.req.isAuthenticated()) {
                return;
            }
            const resizeOptions = {rows: data.rows > 0 ? data.rows : 1, cols: data.cols > 0 ? data.cols : 1};
            this.terminalOptionMap.set((socket.req.user as User).id, resizeOptions);
            if (data.historyId) {
                const history = await this.historyController.findById(data.historyId);
                const historyMainSocket = PlatformServer.socketServer.manager.getHistoryMainSocket(history);
                console.log(`[${DateUtils.getConsoleTime()} | WebSocket, ${socket.req.ip}] TerminalResize - Rows: ${resizeOptions.rows}, Cols: ${resizeOptions.cols}`);
                if (historyMainSocket) {
                    PlatformServer.socketServer.manager.sendTerminalResize(resizeOptions, [historyMainSocket]);
                }
            }
        };
    }

    onReady(server: DefaultWSServer, socket: DefaultWSocket) {
        server.manager.ready([socket]);
    }

    onMessage(server: DefaultWSServer, socket: DefaultWSocket, rawData: RawData, isBinary: boolean) {
        const message = JSON.parse(rawData.toString());
        try {
            this.handles[message.msg](server, socket, message);
        } catch (e) {
            console.error(`[${DateUtils.getConsoleTime()} | WebSocket, ${socket.req.ip}] onMessage - Message: ${JSON.stringify(message)}`);
        }
    }

    onClose(server: DefaultWSServer, socket: DefaultWSocket, code: number, reason: Buffer) {
        /* empty */
    }
}

