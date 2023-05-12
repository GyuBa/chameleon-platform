import {Request, Response} from 'express';
import {DateUtils} from './DateUtils';

export class HTTPLogUtils {
    static addBeginLogger(handler: Function, identifier: string) {
        return (req: Request, res: Response, next: Function) => {
            console.log(`[${DateUtils.getConsoleTime()} | HTTP, ${req.ip}] ${identifier}`);
            handler(req, res, next);
        };
    }
}