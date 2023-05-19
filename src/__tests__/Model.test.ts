import {TestingManager} from './common/TestingManager';
import {PlatformAPI} from "../platform/PlatformAPI";
import {LoginUtils} from "./common/LoginUtils";
import {ModelInputType, ModelSearchOption} from "../types/chameleon-platform.common";


describe('Login', () => {
    beforeAll(async () => {
        await TestingManager.init();
        await LoginUtils.login();
    });

    test('Get Model', async () => {
        try {
            let result = await PlatformAPI.getModels({
                searchOption: ModelSearchOption.REGISTER,
                searchTerm: 'test1'
            });
            console.log(result);
            result = await PlatformAPI.getModels({
                ownOnly: true,
                searchOption: ModelSearchOption.NAME,
                searchTerm: 'Test Model2'
            });
            result = await PlatformAPI.getModels();
            console.log(result.length);
        } catch (e) {
            console.error(e?.response?.data);
        }
    });
});
