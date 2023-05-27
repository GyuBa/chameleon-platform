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
            const earnedResult = await PlatformAPI.getEarnedPointsHistories();
            console.log(result.length);
            console.log(earnedResult);
        } catch (e) {
            console.error(e?.response?.data);
        }
    });
});
