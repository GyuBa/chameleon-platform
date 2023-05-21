import HTTPServer from '../HTTPServer';
import * as fs from 'fs';
import {DefaultSocketServer, DefaultWSServer, PlatformConfig} from '../../types/chameleon-platform';
import {DataSource} from 'typeorm';
import {PlatformService} from '../../service/interfaces/PlatformService';
import * as crypto from 'crypto';

export default class PlatformServer {
    static httpServer: HTTPServer;
    static wsServer: DefaultWSServer;
    static socketServer: DefaultSocketServer;
    static config: PlatformConfig;

    // 외부 접근 사용 지양할 것 (테스트 목적으로만 허용됨)
    static source: DataSource;

    private constructor() {
        /* empty */
    }

    static init(params: { httpServer?: HTTPServer, wsServer?: DefaultWSServer, socketServer?: DefaultSocketServer }) {
        this.loadConfig();
        this.source = new DataSource({
            ...this.config.db,
            entities: ['src/entities/*.ts'],
            logging: false,
            synchronize: true
        });
        PlatformService.init(this.source);

        this.httpServer = params.httpServer;
        this.wsServer = params.wsServer;
        this.socketServer = params.socketServer;
    }

    static loadConfig() {
        if (!fs.existsSync('config.json')) {
            fs.writeFileSync('config.json', JSON.stringify({
                httpPort: 5000,
                socketExternalHost: '',
                socketPort: 5050,
                controllerPath: '../chameleon-controller/controller.tar',
                dependenciesPath: '../chameleon-controller/dependencies.tar',
                sessionSecret: crypto.randomBytes(32).toString('hex'),
                db: {
                    type: 'mysql',
                    host: '',
                    port: 0,
                    username: '',
                    password: '',
                    database: '',
                },
                imp: {
                    key: '',
                    secret: ''
                }
            }, null, 4), 'utf8');
        }
        PlatformServer.config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
        if (!fs.existsSync('uploads/outputs')) {
            fs.mkdirSync('uploads/outputs', {recursive: true});
        }
    }

    static async initializeDB(ignoreError = false) {
        try {
            await this.source.initialize();
            console.log('Data Source has been initialized!');
        } catch (error) {
            if (!ignoreError) {
                console.error('Error during Data Source initialization:', error);
            }
        }
    }

    static async start() {
        await this.initializeDB();
        this.httpServer.listen(this.config.httpPort);
        this.wsServer.start();
        this.socketServer.listen(this.config.socketPort);
    }

    static async stop() {
        await this.source.destroy();
        this.httpServer.close();
        this.socketServer.close();
    }
}