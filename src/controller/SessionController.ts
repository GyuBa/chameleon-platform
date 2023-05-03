import {BaseController} from './interfaces/BaseController';
import {DataSource} from 'typeorm';
import {Session} from '../entities/Session';

export class SessionController extends BaseController<Session> {
    constructor(source: DataSource) {
        super(source, Session);
    }
}