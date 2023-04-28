import axios from "axios";
import PlatformServer from "../../server/core/PlatformServer";
import {wrapper} from 'axios-cookiejar-support';
import {CookieJar} from 'tough-cookie';

export class TestingManager {
    static axios;

    static async init() {
        PlatformServer.loadConfig();
        PlatformServer.init({});
        await PlatformServer.initializeDB(true);
        this.axios = wrapper(axios.create({
            baseURL: 'http://localhost:' + PlatformServer.config.httpPort,
            /*timeout: 1000,*/ jar: new CookieJar()
        }));
    }
}

