import {TestingManager} from './common/TestingManager';
import {PlatformAPI} from "../platform/PlatformAPI";

const testAccount = {
    'email': `test@test.com`,
    'password': 'test',
    'username': 'test'
};

describe('Login', () => {
    beforeAll(async () => await TestingManager.init());

    /*
    afterAll(async () => {
            const userController = new UserController(PlatformServer.source);
            const testUser = await userController.findUserByEmail(testAccount.email);
            if (testUser) {
                await userController.delete(testUser);
            }
        });
    */

    test('sign-up', async () => {
        const result = await PlatformAPI.signUp(testAccount.email, testAccount.password, testAccount.username);
        console.log(result);
    });

    test('sign-in', async () => {
        const result = await PlatformAPI.signIn(testAccount.email, testAccount.password);
        console.log(result);
    });

    /*
        test('change-password', async () => {
            await PlatformAPI.signIn('test8@test.com', 'test');
            const result = await PlatformAPI.modifyPassword('test', 'test1');
            console.log(result);
        });
    */

    test('sign-out', async () => {
        const result = await PlatformAPI.signOut();
        console.log(result);
    });
});
