import {TestingManager} from './common/TestingManager';
import {PlatformAPI} from "../platform/PlatformAPI";
import {LoginUtils} from "./common/LoginUtils";

const testAccount = {
    'email': `test@test.com`,
    'password': 'test',
    'username': 'test'
};

describe('Login', () => {
    beforeAll(async () => {
        await TestingManager.init();
        await LoginUtils.login();
    });

    test('get history', async () => {
        try {
            const result = await PlatformAPI.getHistory(13);
            console.log(result);

        } catch (e) {
            console.error(e?.response?.data);
        }
    });
});
