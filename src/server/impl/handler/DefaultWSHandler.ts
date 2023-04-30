import {RawData} from 'ws';
import {DefaultWSocket, DefaultWSServer, WebSocketHandler} from '../../../types/chameleon-platform';
import {PlatformService} from '../../../service/interfaces/PlatformService';


export default class DefaultWSHandler extends PlatformService implements WebSocketHandler<DefaultWSServer, DefaultWSocket> {
    onReady(server: DefaultWSServer, socket: DefaultWSocket) {
        server.manager.ready([socket]);
    }

    onMessage(server: DefaultWSServer, socket: DefaultWSocket, rawData: RawData, isBinary: boolean) {
        console.log(socket.req.isAuthenticated(), socket.req.user, rawData.toString());
    }

    onClose(server: DefaultWSServer, socket: DefaultWSocket, code: number, reason: Buffer) {
        /* empty */
    }
}

