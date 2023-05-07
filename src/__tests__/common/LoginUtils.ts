import {UserController} from '../../controller/UserController';
import PlatformServer from '../../server/core/PlatformServer';
import {TestingManager} from './TestingManager';

const testAccount = {
    'email': 'test@test.com',
    'password': 'test',
    'username': 'test'
};

export class LoginUtils {
    static async login() {
        const userController = new UserController(PlatformServer.source);
        const testUser = await userController.findByEmail(testAccount.email);
        if (!testUser) {
            await TestingManager.axios.post('/auths/sign-up', testAccount).then(r => r.data);
        }
        await TestingManager.axios.post('/auths/sign-in', testAccount).then(r => ({
            data: r.data,
            cookie: r.headers['set-cookie'][0]
        }));

        /* try {
            const info = await TestingManager.axios.get('/auth/info').then(r => r.data);
            console.log(info);
        } catch (e) {
            console.error(e.response.data);
        } */
    }
}