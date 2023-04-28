import {BaseController} from './interfaces/BaseController';
import {History} from '../entities/History';
import {DataSource} from 'typeorm';

export class HistoryController extends BaseController<History> {
    constructor(source: DataSource) {
        super(source, History);
    }
}