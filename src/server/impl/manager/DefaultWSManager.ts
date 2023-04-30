import WSManager from '../../manager/WSManager';
import {DefaultWSocket} from '../../../types/chameleon-platform';
import {WSMessageType} from "../../../types/chameleon-platform.enum";

export default class DefaultWSManager extends WSManager {
    json(data: any, sockets: DefaultWSocket[] = this.getAllSockets()) {
        sockets.forEach(s => s.send(JSON.stringify(data)));
    }

    ready(sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({msg: WSMessageType.Ready}, sockets);
    }

    getAllSockets() {
        return this.server?.sockets as DefaultWSocket[];
    }
}