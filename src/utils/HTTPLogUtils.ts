import {Request, Response} from "express";

export class HTTPLogUtils {
    static addBeginLogger(handler: Function, identifier: string) {
        return (req: Request, res: Response, next: Function) => {
            console.log(`[HTTP, ${req.ip}] ${identifier}`);
            handler(req, res, next);
        };
    }
}