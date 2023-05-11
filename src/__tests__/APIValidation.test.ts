import {TestingManager} from './common/TestingManager';
import {LoginUtils} from './common/LoginUtils';
import {PlatformAPI} from '../platform/PlatformAPI';
import {HistoryStatus} from '../types/chameleon-platform.common';

describe('API Validation', () => {
    beforeAll(async () => {
        await TestingManager.init();
        await LoginUtils.login();
    });

    test('getHistories', async () => {
        const histories = await PlatformAPI.getHistories();
        console.log(`${histories.length} histories`);
        console.log(histories.filter(h => h.status !== HistoryStatus.CACHED));
        console.log(histories.filter(h => h.status === HistoryStatus.CACHED));
    });

    test('getMyHistories', async () => {
        const histories = await PlatformAPI.getMyHistories();
        console.log(`${histories.length} histories`);
        console.log(histories.filter(h => h.status !== HistoryStatus.CACHED));
        console.log(histories.filter(h => h.status === HistoryStatus.CACHED));
    });


    test('getRegions', async () => {
        const regions = await PlatformAPI.getRegions();
        console.log(`${regions.length} regions`);
        console.log(regions);
    });

    test('getModels', async () => {
        const models = await PlatformAPI.getModels();
        console.log(`${models.length} models`);
        console.log(models);
    });

    test('getMyModels', async () => {
        const models = await PlatformAPI.getMyModels();
        console.log(`${models.length} models`);
        console.log(models);
    });
});
