import {TestingManager} from './common/TestingManager';
import {LoginUtils} from './common/LoginUtils';
import {PaymentAPI} from "../platform/PaymentAPI";
import PlatformServer from "../server/core/PlatformServer";

describe('API Validation', () => {
    beforeAll(async () => {
        await TestingManager.init();
        await LoginUtils.login();
    });

    test('getHistories', async () => {
        try {
            const token = await PaymentAPI.getToken(PlatformServer.config.imp.key, PlatformServer.config.imp.secret);
            console.log(token);
            const data = await PaymentAPI.getPaymentData(token, 'imp_092347193192');
            console.log(data);

        } catch (e) {
            console.log(e);
        }
    });

});
