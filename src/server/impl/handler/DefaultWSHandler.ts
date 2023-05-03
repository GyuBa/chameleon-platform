import {RawData} from 'ws';
import {DefaultWSocket, DefaultWSServer, WebSocketHandle, WebSocketHandler} from '../../../types/chameleon-platform';
import {PlatformService} from '../../../service/interfaces/PlatformService';
import {WSMessageType} from '../../../types/chameleon-platform.enum';
import PlatformServer from '../../core/PlatformServer';


export default class DefaultWSHandler extends PlatformService implements WebSocketHandler<DefaultWSServer, DefaultWSocket> {

    readonly handles: { [messageType: string]: WebSocketHandle } = {};

    constructor() {
        super();

        this.handles[WSMessageType.Path] = async (server: DefaultWSServer, socket: DefaultWSocket, data: any) => {
            console.log(`[WebSocket, ${socket.req.remoteAddress}:${socket.req.remotePort}] Path - ${data.path}`);
            socket.data.path = data.path;
        };

        this.handles[WSMessageType.TerminalResize] = async (server: DefaultWSServer, socket: DefaultWSocket, data: any) => {
            if (!socket.req.isAuthenticated() || data.historyId) {
                return;
            }
            const history = await this.historyController.findById(data.historyId);
            const historySockets = PlatformServer.socketServer.manager.getHistorySockets(history);
            const resizeOptions = {rows: data.rows > 0 ? data.rows : 1, cols: data.cols > 0 ? data.cols : 1};
            console.log(`[WebSocket, ${socket.req.remoteAddress}:${socket.req.remotePort}] TerminalResize - Rows: ${resizeOptions.rows}, Cols: ${resizeOptions.cols}`);
            PlatformServer.socketServer.manager.sendTerminalResize(resizeOptions, historySockets);
        };
    }

    onReady(server: DefaultWSServer, socket: DefaultWSocket) {
        server.manager.ready([socket]);
    }

    onMessage(server: DefaultWSServer, socket: DefaultWSocket, rawData: RawData, isBinary: boolean) {
        const message = JSON.parse(rawData.toString());
        this.handles[message.msg](server, socket, message);
    }

    onClose(server: DefaultWSServer, socket: DefaultWSocket, code: number, reason: Buffer) {
        /* empty */
    }
}

