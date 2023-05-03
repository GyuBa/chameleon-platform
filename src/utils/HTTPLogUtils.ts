import {Request, Response} from "express";

export class HTTPLogUtils {
    static addBeginLogger(handler: Function, identifier: string) {
        return (req: Request, res: Response, next: Function) => {
            console.log(`[HTTP, ${req.socket.remoteAddress}:${req.socket.remotePort}] ${identifier}`);
            handler(req, res, next);
        };
    }
}