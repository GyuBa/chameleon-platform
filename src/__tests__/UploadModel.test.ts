import {TestingManager} from './common/TestingManager';
import {LoginUtils} from './common/LoginUtils';
import * as fs from 'fs';
import {PlatformAPI} from '../platform/PlatformAPI';
import {ModelInputType, ModelOutputType} from "../types/chameleon-platform.common";

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

const modelName = `test-model-${new Date().getTime()}`;
describe('Upload model', () => {
    beforeAll(async () => {
        await TestingManager.init();
        await LoginUtils.login();
    });

    // (chameleon-platform root에서) curl -o test.tar http://files.chameleon.best/images/simple-output-image.tar
    test('upload image', async () => {
        try {
            const result = await PlatformAPI.uploadModelWithImage({
                regionName: 'mongle',
                modelName,
                description: '# test model description',
                inputType: ModelInputType.IMAGE,
                outputType: ModelOutputType.IMAGE,
                parameters: {uischema: {}, schema: {}},
                file: fs.createReadStream('test.tar') as any
                // 주의: Front-end 에서는 fs 모듈이 없으므로 다른 방식으로 처리해야 함
            });
            console.log(result);
        } catch (e) {
            fail(e.response.data);
        }
    }, 2 * 60 * 1000);

    test('upload dockerfile', async () => {
        try {
            const result = await PlatformAPI.uploadModelWithDockerfile({
                regionName: 'mongle',
                modelName,
                description: '# test model description',
                inputType: ModelInputType.IMAGE,
                outputType: ModelOutputType.IMAGE,
                parameters: {uischema: {}, schema: {}},
                files: [fs.createReadStream('Dockerfile') as any]
                // 주의: Front-end 에서는 fs 모듈이 없으므로 다른 방식으로 처리해야 함
            });
            console.log(result);
        } catch (e) {
            fail(e.response.data);
        }
    }, 2 * 60 * 1000);
});
