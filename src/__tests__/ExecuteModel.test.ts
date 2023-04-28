import {TestingManager} from "./common/TestingManager";
import {LoginUtils} from "./common/LoginUtils";
import * as fs from "fs";
import * as FormData from 'form-data';
import PlatformServer from "../server/core/PlatformServer";
import {ModelController} from "../controller/ModelController";

const modelName = `test-model-${new Date().getTime()}`;
describe('Execute model', () => {
    beforeAll(async () => {
        await TestingManager.init();
        await LoginUtils.login();
    });

    // curl -O https://private_raw.abstr.net/mongle/test.tar
    test('upload', async () => {
        const formData = new FormData();
        formData.append('regionName', 'mongle');
        formData.append('modelName', modelName);
        formData.append('description', '# test model description');
        formData.append('inputType', 'image');
        formData.append('outputType', 'image');
        formData.append('parameter', '{}');
        formData.append('file', fs.createReadStream('test.tar'));
        try {
            const result = await TestingManager.axios.post('/model/upload', formData).then(r => r.data);
            console.log(result);
        } catch (e) {
            fail(e.response.data);
        }
    }, 2 * 60 * 1000);

    test('execute', async () => {
        const modelController = new ModelController(PlatformServer.source);
        const model = await modelController.findModelByUniqueName(modelName);
        console.log(model);
        const formData = new FormData();
        formData.append('modelId', model.id);
        try {
            const result = await TestingManager.axios.post('/model/execute', formData).then(r => r.data);
            console.log(result);
        } catch (e) {
            fail(e.response.data);
        }
    });
});
