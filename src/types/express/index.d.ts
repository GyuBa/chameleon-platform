import {User} from '../../entities/User';

declare module 'express' {
    export interface Request {
        user: User
    }
}