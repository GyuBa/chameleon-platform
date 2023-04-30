import {TestingManager} from './common/TestingManager';
import {LoginUtils} from './common/LoginUtils';
import * as fs from 'fs';
import * as FormData from 'form-data';
import PlatformServer from '../server/core/PlatformServer';
import {ModelController} from '../controller/ModelController';

const modelName = `test-model-${new Date().getTime()}`;
describe('Execute model', () => {
    beforeAll(async () => {
        await TestingManager.init();
        await LoginUtils.login();
    });

    // (chameleon-platform root에서) curl -O https://private_raw.abstr.net/mongle/test.tar
    test('upload', async () => {
        const formData = new FormData();
        formData.append('regionName', 'mongle');
        formData.append('modelName', modelName);
        formData.append('description', '# test model description');
        formData.append('inputType', 'image');
        formData.append('outputType', 'image');
        formData.append('parameters', JSON.stringify({uischema: {}, schema: {}}));
        formData.append('file', fs.createReadStream('test.tar'));
        // 주의: Front-end 에서는 fs 모듈이 없으므로 다른 방식으로 처리해야 함
        try {
            const result = await TestingManager.axios.post('/model/upload', formData).then(r => r.data);
            console.log(result);
        } catch (e) {
            fail(e.response.data);
        }
    }, 2 * 60 * 1000);

    // (chameleon-platform root에서) curl -O https://private_raw.abstr.net/mongle/input.png
    test('execute', async () => {
        const modelController = new ModelController(PlatformServer.source);
        const model = await modelController.findModelByUniqueName(modelName);

        const formData = new FormData();
        formData.append('modelId', model.id);
        formData.append('parameters', JSON.stringify({param1: 'example1', param2: 2}));
        // JSONForm의 결과물
        formData.append('input', fs.createReadStream('input.png'));
        // 주의: Front-end 에서는 fs 모듈이 없으므로 다른 방식으로 처리해야 함
        try {
            const result = await TestingManager.axios.post('/model/execute', formData).then(r => r.data);
            console.log(result);
        } catch (e) {
            fail(e.response.data);
        }
    });
});
