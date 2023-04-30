import PlatformServer from '../server/core/PlatformServer';
import {UserController} from '../controller/UserController';
import {TestingManager} from './common/TestingManager';

const testAccount = {
    'email': `test${new Date().getTime()}@test.com`,
    'password': 'test',
    'username': 'test'
};

describe('Login', () => {
    beforeAll(async () => await TestingManager.init());

    afterAll(async () => {
        const userController = new UserController(PlatformServer.source);
        const testUser = await userController.findUserByEmail(testAccount.email);
        if (testUser) {
            await userController.delete(testUser);
        }
    });

    test('sign-up', async () => {
        const result = await TestingManager.axios.post('/auth/sign-up', testAccount).then(r => r.data);
        console.log(result);
    });

    test('sign-in', async () => {
        const result = await TestingManager.axios.post('/auth/sign-in', testAccount).then(r => ({
            data: r.data,
            cookie: r.headers['set-cookie'][0]
        }));
        console.log(result);
    });
});
