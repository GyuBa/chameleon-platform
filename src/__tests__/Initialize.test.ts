import {TestingManager} from './common/TestingManager';
import PlatformServer from '../server/core/PlatformServer';
import {ModelController} from '../controller/ModelController';
import {PlatformAPI} from '../platform/PlatformAPI';
import {Region} from '../entities/Region';
import * as Dockerode from 'dockerode';
import {RegionController} from '../controller/RegionController';
import {HistoryController} from '../controller/HistoryController';
import {UserController} from '../controller/UserController';
import {ModelInputType, ModelOutputType} from '../types/chameleon-platform.common';
import * as fs from 'fs';

const initConfig = JSON.parse(fs.readFileSync('initialize.json', 'utf-8'));
const mainRegion = new Region();
mainRegion.name = initConfig.mainRegion.name;
mainRegion.host = initConfig.mainRegion.host;
mainRegion.port = initConfig.mainRegion.port;
mainRegion.cacheSize = initConfig.mainRegion.cacheSize;

describe('Initialize System', () => {
    beforeAll(async () => {
        await TestingManager.init();
    });

    test('Clear containers', async () => {
        const historyController = new HistoryController(PlatformServer.source);
        const histories = await historyController.getAll();
        for (const history of histories) {
            if (history.containerId && history.model) {
                const docker = new Dockerode(history.model.image.region);
                const container = await docker.getContainer(history.containerId);
                try {
                    console.log('Remove', history.id, history.model.name, history.containerId);
                    await container.remove({force: true});
                } catch (e) {
                    console.error(e);
                }
            }
        }
    });
    test('Clear images', async () => {
        const modelController = new ModelController(PlatformServer.source);
        const models = await modelController.getAll();
        for (const model of models) {
            const docker = new Dockerode(model.image.region);
            const image = await docker.getImage(model.image.uniqueId);
            const containers = await docker.listContainers({all: true});
            const relatedContainers = containers.filter(c => c.ImageID === model.image.uniqueId);
            for (const containerInfo of relatedContainers) {
                try {
                    const container = await docker.getContainer(containerInfo.Id);
                    await container.remove({force: true});
                } catch (e) {
                    console.error(e);
                }
            }
            try {
                console.log('Remove', model.id, model.image.getRepositoryTagString());
                await image.remove({force: true});
            } catch (e) {
                console.error(e);
            }
        }
    }, 10 * 60 * 1000);

    test('Clear Database', async () => {
        await PlatformServer.source.dropDatabase();
        await TestingManager.init();
    });

    test('Generate Region', async () => {
        const regionController = new RegionController(PlatformServer.source);
        await regionController.save(mainRegion);
    });

    test('Generate Test Accounts', async () => {
        const promiseList = [];
        promiseList.push(PlatformAPI.signUp('test@test.com', 'test', 'test'));
        for (let n = 1; n <= 10; n++) {
            promiseList.push(PlatformAPI.signUp(`test${n}@test.com`, 'test', `test${n}`));
        }
        for (const account of initConfig.accounts) {
            promiseList.push(PlatformAPI.signUp(account.email, account.password, account.username));
        }

        await Promise.all(promiseList);

        const userController = new UserController(PlatformServer.source);
        const users = await userController.getAll();
        for (const user of users) {
            user.point = 1000000;
            promiseList.push(userController.save(user));
        }
        await Promise.all(promiseList);
    });

    test('Add images', async () => {
        try {
            await PlatformAPI.signIn('test1@test.com', 'test');
            await PlatformAPI.uploadModelWithImage({
                regionName: 'mongle',
                modelName: 'Image Output Model',
                description: '# Image Output Model \n\n 간단한 형식으로 이미지를 출력하는 모델입니다.',
                inputType: ModelInputType.IMAGE,
                outputType: ModelOutputType.IMAGE,
                parameters: {uischema: {}, schema: {}},
                file: (await PlatformAPI.instance.get('http://files.chameleon.best/images/simple-output-image.tar', {
                    responseType: 'stream'
                })).data
            });

            await PlatformAPI.signIn('test2@test.com', 'test');
            await PlatformAPI.uploadModelWithImage({
                regionName: 'mongle',
                modelName: 'Text Output Model',
                description: '# Text Output Model \n\n 간단한 형식으로 텍스트를 출력하는 모델입니다.',
                inputType: ModelInputType.TEXT,
                outputType: ModelOutputType.TEXT,
                parameters: {uischema: {}, schema: {}},
                file: (await PlatformAPI.instance.get('http://files.chameleon.best/images/simple-output-text.tar', {
                    responseType: 'stream'
                })).data
            });

            await PlatformAPI.signIn('test3@test.com', 'test');
            await PlatformAPI.uploadModelWithImage({
                regionName: 'mongle',
                modelName: 'Sound Output Model',
                description: '# Sound Output Model \n\n 간단한 형식으로 텍스트를 출력하는 모델입니다.',
                inputType: ModelInputType.SOUND,
                outputType: ModelOutputType.SOUND,
                parameters: {uischema: {}, schema: {}},
                file: (await PlatformAPI.instance.get('http://files.chameleon.best/images/simple-output-sound.tar', {
                    responseType: 'stream'
                })).data
            });

            await PlatformAPI.signIn('test4@test.com', 'test');
            await PlatformAPI.uploadModelWithImage({
                regionName: 'mongle',
                modelName: 'Video Output Model',
                description: '# Video Output Model \n\n 간단한 형식으로 비디오를 출력하는 모델입니다.',
                inputType: ModelInputType.VIDEO,
                outputType: ModelOutputType.VIDEO,
                parameters: {uischema: {}, schema: {}},
                file: (await PlatformAPI.instance.get('http://files.chameleon.best/images/simple-output-video.tar', {
                    responseType: 'stream'
                })).data
            });

            await PlatformAPI.signIn('test5@test.com', 'test');
            await PlatformAPI.uploadModelWithImage({
                regionName: 'mongle',
                modelName: 'Empty Input Model',
                description: '# Empty Model \n\n 빈 입력을 받는 모델입니다.',
                inputType: ModelInputType.EMPTY,
                outputType: ModelOutputType.BINARY,
                parameters: {uischema: {}, schema: {}},
                file: (await PlatformAPI.instance.get('http://files.chameleon.best/images/simple-output-image.tar', {
                    responseType: 'stream'
                })).data
            });

            await PlatformAPI.signIn('test6@test.com', 'test');

            await PlatformAPI.uploadModelWithImage({
                regionName: 'mongle',
                modelName: 'Zip Input Model',
                description: '# Empty Model \n\n 여러개의 파일을 받는 모델입니다.',
                inputType: ModelInputType.ZIP,
                outputType: ModelOutputType.BINARY,
                parameters: {uischema: {}, schema: {}},
                file: (await PlatformAPI.instance.get('http://files.chameleon.best/images/simple-output-image.tar', {
                    responseType: 'stream'
                })).data
            });

            for (let i = 1; i <= 30; i++) {
                await PlatformAPI.uploadModelWithImage({
                    regionName: 'mongle',
                    modelName: `Test Model${i}`,
                    description: `# 테스트 ${i} \n\n 테스트용 모델입니다.`,
                    inputType: ModelInputType.IMAGE,
                    outputType: ModelOutputType.IMAGE,
                    parameters: {uischema: {}, schema: {}},
                    file: (await PlatformAPI.instance.get('http://files.chameleon.best/images/simple-output-image.tar', {
                        responseType: 'stream'
                    })).data
                });
            }
        } catch (e) {
            console.error(e);
            fail(e.response.data);
        }
    }, 20 * 60 * 1000);
});
