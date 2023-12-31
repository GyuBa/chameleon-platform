import {TestingManager} from './common/TestingManager';
import {LoginUtils} from './common/LoginUtils';
import * as fs from 'fs';
import PlatformServer from '../server/core/PlatformServer';
import {ModelController} from '../controller/ModelController';
import {PlatformAPI} from '../platform/PlatformAPI';
import {ModelInputType, ModelOutputType} from "../types/chameleon-platform.common";

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

const exampleParameters = {
    'uischema': {
        'type': 'VerticalLayout',
        'elements': [{'type': 'Control', 'scope': '#/properties/name'}]
    }, 'schema': {'type': 'object', 'properties': {'name': {'type': 'string'}}}, 'data': {}
};
const modelName = `test-model-${new Date().getTime()}`;
describe('Execute model', () => {
    beforeAll(async () => {
        await TestingManager.init();
        await LoginUtils.login();
    });

    // (chameleon-platform root에서) curl -o test.tar http://files.chameleon.best/images/simple-output-image.tar
    test('upload', async () => {
        try {
            const result = await PlatformAPI.uploadModelWithImage({
                regionName: 'mongle',
                modelName,
                description: '# test model description',
                inputType: ModelInputType.IMAGE,
                outputType: ModelOutputType.IMAGE,
                parameters: exampleParameters,
                file: fs.createReadStream('test.tar') as any
                // 주의: Front-end 에서는 fs 모듈이 없으므로 다른 방식으로 처리해야 함
            });
            console.log(result);
        } catch (e) {
            fail(e.response.data);
        }
    }, 2 * 60 * 1000);

    // (chameleon-platform root에서) curl -O http://files.chameleon.best/samples/image.png
    const testExecute = async () => {
        const modelController = new ModelController(PlatformServer.source);
        const model = await modelController.findByUniqueName(modelName);

        try {
            const result = PlatformAPI.executeModel({
                modelId: model.id,
                parameters: exampleParameters,
                input: fs.createReadStream('image.png') as any
            });
            console.log(result);
        } catch (e) {
            fail(e.response.data);
        }
    };

    test('execute', testExecute, 2 * 60 * 1000);

    test('wait for caching1', async () => {
        await sleep(15 * 1000);
    }, 2 * 60 * 1000);

    test('execute with cache1', testExecute, 2 * 60 * 1000);

    test('wait for caching2', async () => {
        await sleep(15 * 1000);
    }, 2 * 60 * 1000);

    test('execute with cache2', testExecute, 2 * 60 * 1000);
});
