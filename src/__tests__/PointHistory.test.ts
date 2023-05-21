import {TestingManager} from './common/TestingManager';
import {PlatformAPI} from '../platform/PlatformAPI';
import {LoginUtils} from './common/LoginUtils';

describe('Login', () => {
    beforeAll(async () => {
        await TestingManager.init();
        await LoginUtils.login();
    });

    test('get point history', async () => {
        try {
            const result = await PlatformAPI.getPointsHistories();
            console.log(result);

        } catch (e) {
            console.error(e?.response?.data);
        }
    });
});
