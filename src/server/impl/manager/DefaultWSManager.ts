import WSManager from '../../manager/WSManager';
import {DefaultWSocket} from '../../../types/chameleon-platform';
import {Model} from '../../../entities/Model';
import {History} from '../../../entities/History';
import {WSMessageType, WSTerminalBufferMessage, WSUpdateHistoryMessage} from '../../../types/chameleon-platform.common';

export default class DefaultWSManager extends WSManager {
    json(data: any, sockets: DefaultWSocket[] = this.getAllSockets()) {
        sockets.forEach(s => s.send(JSON.stringify(data)));
    }

    ready(sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({msg: WSMessageType.READY}, sockets);
    }

    getAllSockets() {
        return this.server?.sockets as DefaultWSocket[];
    }

    getAuthenticatedSockets() {
        return this.server?.sockets.filter(s => s.req.isAuthenticated());
    }

    getModelSockets(model: Model, sockets: DefaultWSocket[] = this.getAllSockets()) {
        return sockets.filter(s => s.data.path?.startsWith(`model/${model.register.username}/${model.uniqueName}`));
    }

    getHistorySockets(history: History, sockets: DefaultWSocket[] = this.getAllSockets()) {
        return sockets.filter(s => s.data.path?.startsWith(`history/${history.id}`));
    }

    getHistoryRelatedSockets(history: History, sockets: DefaultWSocket[] = this.getAllSockets()) {
        return [...this.getModelSockets(history.model, sockets), ...this.getHistorySockets(history, sockets)];
    }

    sendUpdateHistory(history: History, sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({msg: WSMessageType.UPDATE_HISTORY, history: history.toData()} as WSUpdateHistoryMessage, sockets);
    }

    sendTerminalBuffer(data: string, sockets: DefaultWSocket[] = this.getAllSockets()) {
        this.json({msg: WSMessageType.TERMINAL_BUFFER, data} as WSTerminalBufferMessage, sockets);
    }

}