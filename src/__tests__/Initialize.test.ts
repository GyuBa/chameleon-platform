import {TestingManager} from './common/TestingManager';
import PlatformServer from '../server/core/PlatformServer';
import {ModelController} from '../controller/ModelController';
import {PlatformAPI} from '../platform/PlatformAPI';
import {Region} from '../entities/Region';
import {History} from '../entities/History';
import * as Dockerode from 'dockerode';
import {RegionController} from '../controller/RegionController';
import {HistoryController} from '../controller/HistoryController';
import {UserController} from '../controller/UserController';
import {HistoryStatus, ModelInputType, ModelOutputType, PointHistoryType} from '../types/chameleon-platform.common';
import * as fs from 'fs';
import {PointHistoryController} from '../controller/PointHistoryController';
import {PointHistory} from '../entities/PointHistory';
import {clearInterval} from 'timers';
import {User} from '../entities/User';

const initConfig = JSON.parse(fs.readFileSync('initialize.json', 'utf-8'));
const mainRegion = new Region();
mainRegion.name = initConfig.mainRegion.name;
mainRegion.host = initConfig.mainRegion.host;
mainRegion.port = initConfig.mainRegion.port;
mainRegion.useGPU = initConfig.mainRegion.useGPU;
mainRegion.cacheSize = initConfig.mainRegion.cacheSize;

const subRegion = new Region();
subRegion.name = initConfig.subRegion.name;
subRegion.host = initConfig.subRegion.host;
subRegion.port = initConfig.subRegion.port;
subRegion.useGPU = initConfig.subRegion.useGPU;
subRegion.cacheSize = initConfig.subRegion.cacheSize;

const dummyRegion = new Region();
dummyRegion.name = initConfig.dummyRegion.name;
dummyRegion.host = initConfig.dummyRegion.host;
dummyRegion.port = initConfig.dummyRegion.port;
dummyRegion.useGPU = initConfig.dummyRegion.useGPU;
dummyRegion.cacheSize = initConfig.dummyRegion.cacheSize;

const accounts = initConfig.accounts as User[];

const dummies = [{
    modelName: 'Text Summarization',
    description: '# Text Summarization \n\n 이 모델은 BERT 기반으로 긴 텍스트를 짧게 요약하는 인공지능 모델입니다.',
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.TEXT,
    category: 'Natural Language Processing'
}, {
    modelName: 'Image Classification',
    description: '# Image Classification \n\n 이 모델은 Convolutional Neural Network를 사용하여 이미지를 분류하는 인공지능 모델입니다.',
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.TEXT,
    category: 'Image Processing'
}, {
    modelName: 'Speech Recognition',
    description: '# Speech Recognition \n\n 이 모델은 음성을 텍스트로 변환하는 인공지능 모델입니다.',
    inputType: ModelInputType.SOUND,
    outputType: ModelOutputType.TEXT,
    category: 'Speech Processing'
}, {
    modelName: 'Video Object Detection',
    description: '# Video Object Detection \n\n 이 모델은 YOLO 알고리즘을 이용하여 비디오에서 객체를 탐지하는 인공지능 모델입니다.',
    inputType: ModelInputType.VIDEO,
    outputType: ModelOutputType.VIDEO,
    category: 'Video Processing'
}, {
    modelName: 'Image Colorization',
    description: '# Image Colorization \n\n 이 모델은 흑백 이미지를 컬러로 변환하는 인공지능 모델입니다.',
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.IMAGE,
    category: 'Image Processing'
}, {
    modelName: 'Sentiment Analysis',
    description: '# Sentiment Analysis \n\n 이 모델은 텍스트에서 감정을 분석하는 인공지능 모델입니다.',
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.TEXT,
    category: 'Natural Language Processing'
}, {
    modelName: 'Sound Generation',
    description: '# Sound Generation \n\n 이 모델은 텍스트를 소리로 변환하는 인공지능 모델입니다.',
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.SOUND,
    category: 'Speech Processing'
}, {
    modelName: 'Pose Estimation',
    description: '# Pose Estimation \n\n 이 모델은 이미지 또는 비디오에서 인간의 자세를 추정하는 인공지능 모델입니다.',
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.IMAGE,
    category: 'Image Processing'
}, {
    modelName: 'Music Generation',
    description: '# Music Generation \n\n 이 모델은 인공지능을 이용해 새로운 음악을 생성합니다.',
    inputType: ModelInputType.EMPTY,
    outputType: ModelOutputType.SOUND,
    category: 'Sound Processing'
}, {
    modelName: 'Chatbot',
    description: '# Chatbot \n\n 이 모델은 사용자의 질문에 대해 자연스러운 답변을 생성하는 인공지능 모델입니다.',
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.TEXT,
    category: 'Natural Language Processing'
}, {
    modelName: 'Image Compression',
    description: '# Image Compression \n\n 이 모델은 이미지를 효과적으로 압축하는 인공지능 모델입니다.',
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.BINARY,
    category: 'Image Processing'
}, {
    modelName: 'Speech-to-Text',
    description: '# Speech-to-Text \n\n 이 모델은 오디오 스피치를 텍스트로 변환하는 인공지능 모델입니다.',
    inputType: ModelInputType.SOUND,
    outputType: ModelOutputType.TEXT,
    category: 'Speech Processing'
}, {
    modelName: 'Object Segmentation',
    description: '# Object Segmentation \n\n 이 모델은 이미지에서 개체를 분할하고 분류하는 인공지능 모델입니다.',
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.IMAGE,
    category: 'Image Processing'
}, {
    modelName: 'Text-to-Speech',
    description: '# Text-to-Speech \n\n 이 모델은 텍스트를 사람처럼 말하는 소리로 변환하는 인공지능 모델입니다.',
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.SOUND,
    category: 'Speech Processing'
}, {
    modelName: 'Facial Recognition',
    description: '# Facial Recognition \n\n 이 모델은 사진이나 비디오에서 얼굴을 인식하는 인공지능 모델입니다.',
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.TEXT,
    category: 'Image Processing'
}, {
    modelName: 'Machine Translation',
    description: '# Machine Translation \n\n 이 모델은 한 언어의 텍스트를 다른 언어로 번역하는 인공지능 모델입니다.',
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.TEXT,
    category: 'Natural Language Processing'
}, {
    modelName: 'Handwriting Recognition',
    description: '# Handwriting Recognition \n\n 이 모델은 손글씨 텍스트를 디지털 텍스트로 변환하는 인공지능 모델입니다.',
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.TEXT,
    category: 'Image Processing'
}, {
    modelName: 'Voice Cloning',
    description: '# Voice Cloning \n\n 이 모델은 주어진 음성 샘플로부터 음성을 복제하는 인공지능 모델입니다.',
    inputType: ModelInputType.SOUND,
    outputType: ModelOutputType.SOUND,
    category: 'Speech Processing'
}, {
    modelName: 'Keyword Extraction',
    description: '# Keyword Extraction \n\n 이 모델은 주어진 텍스트에서 핵심 키워드를 추출하는 인공지능 모델입니다.',
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.TEXT,
    category: 'Natural Language Processing'
}, {
    modelName: 'Optical Character Recognition',
    description: '# Optical Character Recognition \n\n 이 모델은 이미지에서 텍스트를 인식하여 디지털 텍스트로 변환하는 인공지능 모델입니다.',
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.TEXT,
    category: 'Image Processing'
}, {
    modelName: 'Video Frame Interpolation',
    description: '# Video Frame Interpolation \n\n 이 모델은 비디오 프레임 사이를 채워서 비디오의 부드러움을 높이는 인공지능 모델입니다.',
    inputType: ModelInputType.VIDEO,
    outputType: ModelOutputType.VIDEO,
    category: 'Video Processing'
}, {
    modelName: 'Topic Modelling',
    description: '# Topic Modelling \n\n 이 모델은 주어진 텍스트의 주제를 분석하고 분류하는 인공지능 모델입니다.',
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.TEXT,
    category: 'Natural Language Processing'
}, {
    modelName: 'Image Style Transfer',
    description: '# Image Style Transfer \n\n 이 모델은 한 이미지의 스타일을 다른 이미지로 전송하는 인공지능 모델입니다.',
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.IMAGE,
    category: 'Image Processing'
}, {
    modelName: 'Emotion Detection',
    description: '# Emotion Detection \n\n 이 모델은 텍스트나 음성에서 감정을 판단하는 인공지능 모델입니다.',
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.TEXT,
    category: 'Natural Language Processing'
}, {
    modelName: 'Image Deblurring',
    description: '# Image Deblurring \n\n 이 모델은 이미지에서 흐림을 제거하는 인공지능 모델입니다.',
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.IMAGE,
    category: 'Image Processing'
}, {
    modelName: 'Audio Noise Reduction',
    description: '# Audio Noise Reduction \n\n 이 모델은 오디오에서 노이즈를 제거하는 인공지능 모델입니다.',
    inputType: ModelInputType.SOUND,
    outputType: ModelOutputType.SOUND,
    category: 'Sound Processing'
}, {
    modelName: 'Automatic Captioning',
    description: '# Automatic Captioning \n\n 이 모델은 이미지 또는 비디오에 대한 캡션을 자동으로 생성하는 인공지능 모델입니다.',
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.TEXT,
    category: 'Multimedia Processing'
}, {
    modelName: 'Document Layout Analysis',
    description: '# Document Layout Analysis \n\n 이 모델은 문서의 레이아웃을 분석하여 텍스트, 이미지, 표 등의 위치를 파악하는 인공지능 모델입니다.',
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.TEXT,
    category: 'Document Processing'
}, {
    modelName: 'Text Generation',
    description: '# Text Generation \n\n 이 모델은 주어진 텍스트에 이어질 새로운 텍스트를 생성하는 인공지능 모델입니다.',
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.TEXT,
    category: 'Natural Language Processing'
}, {
    modelName: 'Scene Recognition',
    description: '# Scene Recognition \n\n 이 모델은 이미지나 비디오의 씬을 인식하고 분류하는 인공지능 모델입니다.',
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.TEXT,
    category: 'Image Processing'
}
];
const exampleParameters = {
    'uischema': {
        'type': 'VerticalLayout',
        'elements': [{'type': 'Control', 'scope': '#/properties/name'}]
    }, 'schema': {'type': 'object', 'properties': {'name': {'type': 'string'}}}, 'data': {}
};

const emptyParameters = {
    schema: {
        'type': 'object',
        'properties': {}
    },
    uischema: {
        'type': 'VerticalLayout',
        'elements': []
    },
    data: {}
};

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
                    // console.error(e);
                }
            }
        }
    }, 10 * 60 * 1000);
    test('Clear images', async () => {
        const modelController = new ModelController(PlatformServer.source);
        const models = await modelController.getAll();
        for (const model of models) {
            const docker = new Dockerode(model.image.region);
            const image = await docker.getImage(model.image.getRepositoryTagString());
            const containers = await docker.listContainers({all: true});
            const relatedContainers = containers.filter(c => c.ImageID === model.image.uniqueId);
            for (const containerInfo of relatedContainers) {
                try {
                    const container = await docker.getContainer(containerInfo.Id);
                    await container.remove({force: true});
                } catch (e) {
                    // console.error(e);
                }
            }
            try {
                console.log('Remove', model.id, model.image.getRepositoryTagString());
                await image.remove({force: true});
            } catch (e) {
                // console.error(e);
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
        await regionController.save(subRegion);
        await regionController.save(dummyRegion);
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

    test('Add sample model & history', async () => {
        console.log('Creating test:binary-output-model');
        await PlatformAPI.signIn('test@test.com', 'test');
        await PlatformAPI.uploadModelWithImage({
            regionName: mainRegion.name,
            modelName: 'Binary Output Model',
            description: '# Binary Output Model \n\n 간단한 형식으로 파일을 출력하는 모델입니다.',
            inputType: ModelInputType.BINARY,
            outputType: ModelOutputType.BINARY,
            parameters: exampleParameters,
            file: (await PlatformAPI.instance.get('http://files.chameleon.best/images/simple-output-image.tar', {
                responseType: 'stream'
            })).data,
            category: 'Sample',
            price: 0
        });
        await PlatformAPI.executeModel({
            modelId: (await PlatformAPI.getModelByUsernameAndUniqueName('test', 'binary-output-model')).id,
            parameters: exampleParameters.data,
            input: (await PlatformAPI.instance.get('http://files.chameleon.best/samples/image.png', {
                responseType: 'stream'
            })).data
        });
        const historyController = new HistoryController(PlatformServer.source);
        await new Promise(resolve => {
            const i = setInterval(async async_ => {
                try {
                    const history = await historyController.findById(1);
                    if (history.status == HistoryStatus.FINISHED) {
                        clearInterval(i);
                        resolve(undefined);
                    }
                } catch (e) {
                    /* empty */
                }
            }, 250);
        });
    }, 60 * 60 * 1000);

    test('Test Point Histories', async () => {
        const pointHistoryController = new PointHistoryController(PlatformServer.source);
        const userController = new UserController(PlatformServer.source);
        const historyController = new HistoryController(PlatformServer.source);
        const dummyHistory: History = await historyController.findById(1);
        console.log(dummyHistory);
        const user = await userController.findByEmail('test@test.com');
        for (let i = 0; i < 100; i++) {
            const randomDelta = Math.random() * 100 - 50;
            user.point += randomDelta;
            const pointHistory = new PointHistory();
            pointHistory.delta = randomDelta;
            pointHistory.leftPoint = user.point;
            pointHistory.user = user;
            if (randomDelta > 0) {
                pointHistory.type = PointHistoryType.CHARGE;
            } else {
                pointHistory.modelHistory = dummyHistory;
                pointHistory.type = PointHistoryType.USE_PAID_MODEL;
            }
            await pointHistoryController.save(pointHistory);
        }
        await userController.save(user);
    }, 60 * 60 * 1000);

    test('Add images', async () => {
        try {
            console.log('Creating test1:image-output-model');
            await PlatformAPI.signIn('test1@test.com', 'test');
            await PlatformAPI.uploadModelWithImage({
                regionName: mainRegion.name,
                modelName: 'Image Output Model',
                description: '# Image Output Model \n\n 간단한 형식으로 이미지를 출력하는 모델입니다.',
                inputType: ModelInputType.IMAGE,
                outputType: ModelOutputType.IMAGE,
                parameters: exampleParameters,
                file: (await PlatformAPI.instance.get('http://files.chameleon.best/images/simple-output-image.tar', {
                    responseType: 'stream'
                })).data,
                category: 'Image Upscaling',
                price: 0
            });

            await PlatformAPI.executeModel({
                modelId: (await PlatformAPI.getModelByUsernameAndUniqueName('test1', 'image-output-model')).id,
                parameters: exampleParameters.data,
                input: (await PlatformAPI.instance.get('http://files.chameleon.best/samples/image.png', {
                    responseType: 'stream'
                })).data
            });

            console.log('Creating test2:text-output-model');
            await PlatformAPI.signIn('test2@test.com', 'test');
            await PlatformAPI.uploadModelWithImage({
                regionName: mainRegion.name,
                modelName: 'Text Output Model',
                description: '# Text Output Model \n\n 간단한 형식으로 텍스트를 출력하는 모델입니다.',
                inputType: ModelInputType.TEXT,
                outputType: ModelOutputType.TEXT,
                parameters: exampleParameters,
                file: (await PlatformAPI.instance.get('http://files.chameleon.best/images/simple-output-text.tar', {
                    responseType: 'stream'
                })).data,
                category: 'NLP',
                price: 0
            });

            await PlatformAPI.executeModel({
                modelId: (await PlatformAPI.getModelByUsernameAndUniqueName('test2', 'text-output-model')).id,
                parameters: exampleParameters.data,
                input: (await PlatformAPI.instance.get('http://files.chameleon.best/samples/text.txt', {
                    responseType: 'stream'
                })).data
            });

            console.log('Creating test3:text-output-model');
            await PlatformAPI.signIn('test3@test.com', 'test');
            await PlatformAPI.uploadModelWithImage({
                regionName: mainRegion.name,
                modelName: 'Sound Output Model',
                description: '# Sound Output Model \n\n 간단한 형식으로 사운드를 출력하는 모델입니다.',
                inputType: ModelInputType.SOUND,
                outputType: ModelOutputType.SOUND,
                parameters: exampleParameters,
                file: (await PlatformAPI.instance.get('http://files.chameleon.best/images/simple-output-sound.tar', {
                    responseType: 'stream'
                })).data,
                category: 'Voice Recognition',
                price: 0
            });

            await PlatformAPI.executeModel({
                modelId: (await PlatformAPI.getModelByUsernameAndUniqueName('test3', 'sound-output-model')).id,
                parameters: exampleParameters.data,
                input: (await PlatformAPI.instance.get('http://files.chameleon.best/samples/sound.mp3', {
                    responseType: 'stream'
                })).data
            });

            console.log('Creating test4:video-output-model');
            await PlatformAPI.signIn('test4@test.com', 'test');
            await PlatformAPI.uploadModelWithImage({
                regionName: mainRegion.name,
                modelName: 'Video Output Model',
                description: '# Video Output Model \n\n 간단한 형식으로 비디오를 출력하는 모델입니다.',
                inputType: ModelInputType.VIDEO,
                outputType: ModelOutputType.VIDEO,
                parameters: exampleParameters,
                file: (await PlatformAPI.instance.get('http://files.chameleon.best/images/simple-output-video.tar', {
                    responseType: 'stream'
                })).data,
                category: 'Object Detection',
                price: 0
            });

            await PlatformAPI.executeModel({
                modelId: (await PlatformAPI.getModelByUsernameAndUniqueName('test4', 'video-output-model')).id,
                parameters: exampleParameters.data,
                input: (await PlatformAPI.instance.get('http://files.chameleon.best/samples/video.mp4', {
                    responseType: 'stream'
                })).data
            });

            console.log('Creating test5:empty-output-model');
            await PlatformAPI.signIn('test5@test.com', 'test');
            await PlatformAPI.uploadModelWithImage({
                regionName: mainRegion.name,
                modelName: 'Empty Input Model',
                description: '# Empty Model \n\n 빈 입력을 받는 모델입니다.',
                inputType: ModelInputType.EMPTY,
                outputType: ModelOutputType.BINARY,
                parameters: exampleParameters,
                file: (await PlatformAPI.instance.get('http://files.chameleon.best/images/simple-output-image.tar', {
                    responseType: 'stream'
                })).data
            });

            // Temporal
            await PlatformAPI.executeModel({
                modelId: (await PlatformAPI.getModelByUsernameAndUniqueName('test5', 'empty-input-model')).id,
                parameters: exampleParameters.data,
                input: (await PlatformAPI.instance.get('http://files.chameleon.best/samples/text.txt', {
                    responseType: 'stream'
                })).data
            });

            console.log('Creating test6:files-input-model');
            await PlatformAPI.signIn('test6@test.com', 'test');
            await PlatformAPI.uploadModelWithDockerfile({
                regionName: mainRegion.name,
                modelName: 'Files Input Model',
                description: '# Files Input Model \n\n 여러개의 파일을 받는 모델입니다.',
                inputType: ModelInputType.FILES,
                outputType: ModelOutputType.ZIP_GALLERY,
                parameters: exampleParameters,
                files: [(await PlatformAPI.instance.get('http://files.chameleon.best/dockerfiles/SimpleEcho/Dockerfile', {
                    responseType: 'stream'
                })).data],
                price: 0
            });

            await PlatformAPI.executeModel({
                modelId: (await PlatformAPI.getModelByUsernameAndUniqueName('test6', 'files-input-model')).id,
                parameters: exampleParameters.data,
                input: (await PlatformAPI.instance.get('http://files.chameleon.best/samples/samples.zip', {
                    responseType: 'stream'
                })).data
            });

            console.log('Creating test6:files-input-model');
            await PlatformAPI.signIn('test6@test.com', 'test');
            await PlatformAPI.uploadModelWithDockerfile({
                regionName: mainRegion.name,
                modelName: 'HTML Output Model',
                description: '# HTML Output Model \n\n 입력 HTML을 그대로 출력합니다.',
                inputType: ModelInputType.BINARY,
                outputType: ModelOutputType.HTML,
                parameters: exampleParameters,
                files: [(await PlatformAPI.instance.get('http://files.chameleon.best/dockerfiles/SimpleEcho/Dockerfile', {
                    responseType: 'stream'
                })).data],
                price: 0
            });

            const mongle = accounts.find(u => u.username === 'mongle');
            console.log(`Creating ${mongle.username}:sound-modulation`);
            await PlatformAPI.signIn(mongle.email, mongle.password);
            await PlatformAPI.uploadModelWithImage({
                price: 150,
                regionName: mainRegion.name,
                modelName: 'Sound Modulation',
                description: '# Sound Modulation\n' +
                    '이 모델은 `equalizer`를 이용하여 음성을 변조합니다.\n' +
                    '\n' +
                    '- `pitch` (-1000\\~1000)\n' +
                    '  음성의 `pitch`를 조절합니다.(템포 변경이 아님)\n' +
                    '\n' +
                    '- `contrast`(0\\~100)\n' +
                    '  이 효과는 압축과 유사하게 동작하며, 오디오 신호를 더 크게 들리게 수정합니다. 수치는 0~100 범위로 0은 대비량을 극대화 시킵니다.\n' +
                    '  \n' +
                    '- `echo` (boolean)\n' +
                    '  아래 `echo` 옵션을 적용합니다.\n' +
                    '  \n' +
                    '```json\n' +
                    '{\n' +
                    ' gain_in : 0,\n' +
                    ' gain_out : 1,\n' +
                    ' delay : 20,\n' +
                    ' decay : 0.4\n' +
                    '}\n' +
                    '```',
                inputType: ModelInputType.SOUND,
                outputType: ModelOutputType.SOUND,
                category: 'Sound Processing',
                parameters: {
                    'data': {
                        'echo': true,
                        'pitch': 500,
                        'preset': 'old',
                        'contrast': 100
                    },
                    'schema': {
                        'type': 'object',
                        'properties': {
                            'echo': {
                                'type': 'boolean',
                                'default': true
                            },
                            'pitch': {
                                'type': 'number',
                                'default': 500,
                                'minimum': -1000
                            },
                            'preset': {
                                'enum': [
                                    'old',
                                    'adult',
                                    'child',
                                    'custom'
                                ],
                                'type': 'string',
                                'default': 'old'
                            },
                            'contrast': {
                                'type': 'number',
                                'default': 100,
                                'maximum': 100,
                                'minimum': 0
                            }
                        }
                    },
                    'uischema': {
                        'type': 'VerticalLayout',
                        'elements': [
                            {
                                'type': 'Control',
                                'scope': '#/properties/preset'
                            },
                            {
                                'type': 'Control',
                                'scope': '#/properties/pitch'
                            },
                            {
                                'type': 'Control',
                                'scope': '#/properties/contrast'
                            },
                            {
                                'type': 'Control',
                                'scope': '#/properties/echo'
                            }
                        ]
                    }
                },
                imageName: 'sound-modulation:latest'
            });
            console.log(`Creating ${mongle.username}:image-captioning`);
            await PlatformAPI.uploadModelWithImage({
                regionName: mainRegion.name,
                modelName: 'Image Captioning',
                price: 200,
                description: '# Image Captioning \n\n 이미지를 묘사하는 텍스트를 생성하는 모델입니다',
                inputType: ModelInputType.IMAGE,
                outputType: ModelOutputType.TEXT,
                category: 'Image Processing',
                parameters: emptyParameters,
                imageName: 'image-captioning:latest'
            });

            console.log(`Creating ${mongle.username}:object-detection`);
            await PlatformAPI.uploadModelWithImage({
                regionName: mainRegion.name,
                price: 250,
                modelName: 'Object Detection',
                description: '# Object Detection\n' +
                    '\n' +
                    '이 모델은 영상 내에 존재하는 사물을 인식합니다. Ultralytics YOLOv8을 이용하여, 사물을 인식하고 이를 영상에 표현합니다.\n' +
                    '\n' +
                    '```shell\n' +
                    'yolo detect predict model="$model" source="/opt/mctr/i/raw.mp4"\n' +
                    '```\n' +
                    '\n' +
                    '- model\n' +
                    '\n' +
                    '  이용할 YOLO 모델의 종류를 선택합니다.\n' +
                    '\n' +
                    '## YOLO 종류\n' +
                    '\n' +
                    '| Model   | size(pixels) | mAP  | Speed(CPU) | Speed(TensorRT) | params(M) | FLOPs(B) |\n' +
                    '| ------- | ------------ | ---- | ---------- | --------------- | --------- | -------- |\n' +
                    '| YOLOv8n | 640          | 37.3 | 80.4       | 0.99            | 3.2       | 8.7      |\n' +
                    '| YOLOv8s | 640          | 44.9 | 128.4      | 1.20            | 11.2      | 28.6     |\n' +
                    '| YOLOv8m | 640          | 50.2 | 234.7      | 1.83            | 25.9      | 78.9     |\n' +
                    '| YOLOv8l | 640          | 52.9 | 375.2      | 2.39            | 43.7      | 165.2    |\n' +
                    '| YOLOv8x | 640          | 53.9 | 479.1      | 3.53            | 68.2      | 257.8    |\n' +
                    '\n' +
                    '## 매개변수\n' +
                    '\n' +
                    '```json\n' +
                    '{\n' +
                    '    "model": "yolov8n.pt"\n' +
                    '}\n' +
                    '```',
                inputType: ModelInputType.VIDEO,
                outputType: ModelOutputType.VIDEO,
                category: 'Object Detection',
                parameters: {
                    'data': {'model': 'yolov8m.pt'},
                    'schema': {
                        'type': 'object',
                        'properties': {
                            'model': {
                                'enum': ['yolov8m.pt', 'yolov8n.pt', 'yolov8s.pt', 'yolov8l.pt', 'yolov8x.pt'],
                                'type': 'string',
                                'default': 'yolov8m.pt',
                                'description': 'Yolo Model'
                            }
                        }
                    },
                    'uischema': {
                        'type': 'VerticalLayout',
                        'elements': [{'type': 'Control', 'scope': '#/properties/model'}]
                    }
                },
                imageName: 'object-detection:latest'
            });

            console.log(`Creating ${mongle.username}:sentence-generator`);
            await PlatformAPI.uploadModelWithImage({
                regionName: mainRegion.name,
                modelName: 'Sentence Generator',
                price: 100,
                description: '# Sentence Generator \n\n 촘스키의 변형 생성 문법을 기반으로 자연어 문장을 생성합니다. \n\n 명사(nouns), 자동사(intransitive_verb), 타동사(transitive_verb)를 입력하여 다양한 종류의 영어 문장을 생성할 수 있습니다. ',
                inputType: ModelInputType.EMPTY,
                outputType: ModelOutputType.TEXT,
                category: 'Sentence Generator',
                parameters: {
                    'data': {
                        'parameters': [
                            {
                                'type': 'nouns',
                                'content': 'DuckSu'
                            },
                            {
                                'type': 'nouns',
                                'content': 'JinHyung'
                            },
                            {
                                'type': 'nouns',
                                'content': 'DaeJune'
                            },
                            {
                                'type': 'nouns',
                                'content': 'HoeJong'
                            },
                            {
                                'type': 'nouns',
                                'content': 'JaeHong'
                            },
                            {
                                'type': 'nouns',
                                'content': 'JiWoo'
                            },
                            {
                                'type': 'nouns',
                                'content': 'SangWon'
                            },
                            {
                                'type': 'nouns',
                                'content': 'SangBeom'
                            },
                            {
                                'type': 'nouns',
                                'content': 'SangHyeon'
                            },
                            {
                                'type': 'nouns',
                                'content': 'YouChan'
                            },
                            {
                                'type': 'nouns',
                                'content': 'YoungWo'
                            },
                            {
                                'type': 'nouns',
                                'content': 'koreatech students'
                            },
                            {
                                'type': 'nouns',
                                'content': 'chodings'
                            },
                            {
                                'type': 'nouns',
                                'content': 'gongdoris'
                            },
                            {
                                'type': 'nouns',
                                'content': 'languages'
                            },
                            {
                                'type': 'nouns',
                                'content': 'computers'
                            },
                            {
                                'type': 'nouns',
                                'content': 'tricks'
                            },
                            {
                                'type': 'nouns',
                                'content': 'rules'
                            },
                            {
                                'type': 'nouns',
                                'content': 'linguists'
                            },
                            {
                                'type': 'nouns',
                                'content': 'programmers'
                            },
                            {
                                'type': 'nouns',
                                'content': 'neuroscientists'
                            },
                            {
                                'type': 'nouns',
                                'content': 'horses'
                            },
                            {
                                'type': 'nouns',
                                'content': 'dragons'
                            },
                            {
                                'type': 'intransitive_verb',
                                'content': 'walk'
                            },
                            {
                                'type': 'intransitive_verb',
                                'content': 'sleep'
                            },
                            {
                                'type': 'intransitive_verb',
                                'content': 'exist'
                            },
                            {
                                'type': 'intransitive_verb',
                                'content': 'die'
                            },
                            {
                                'type': 'intransitive_verb',
                                'content': 'sing'
                            },
                            {
                                'type': 'intransitive_verb',
                                'content': 'hop'
                            },
                            {
                                'type': 'intransitive_verb',
                                'content': 'toss and turn'
                            },
                            {
                                'type': 'intransitive_verb',
                                'content': 'run'
                            },
                            {
                                'type': 'intransitive_verb',
                                'content': 'fly'
                            },
                            {
                                'type': 'intransitive_verb',
                                'content': 'transform'
                            },
                            {
                                'type': 'intransitive_verb',
                                'content': 'conjugate'
                            },
                            {
                                'type': 'transitive_verb',
                                'content': 'love'
                            },
                            {
                                'type': 'transitive_verb',
                                'content': 'hate'
                            },
                            {
                                'type': 'transitive_verb',
                                'content': 'eat'
                            },
                            {
                                'type': 'transitive_verb',
                                'content': 'kill'
                            },
                            {
                                'type': 'transitive_verb',
                                'content': 'make'
                            },
                            {
                                'type': 'transitive_verb',
                                'content': 'need'
                            },
                            {
                                'type': 'transitive_verb',
                                'content': 'flirt with'
                            },
                            {
                                'type': 'transitive_verb',
                                'content': 'enjoy'
                            },
                            {
                                'type': 'transitive_verb',
                                'content': 'are angry with'
                            },
                            {
                                'type': 'transitive_verb',
                                'content': 'be in fact'
                            },
                            {
                                'type': 'transitive_verb',
                                'content': 'be'
                            },
                            {
                                'type': 'transitive_verb',
                                'content': 'transform into'
                            },
                            {
                                'type': 'transitive_verb',
                                'content': 'study'
                            }
                        ],
                        'numberOfSentence': 5
                    },
                    'schema': {
                        'properties': {
                            'parameters': {
                                'type': 'array',
                                'items': {
                                    'type': 'object',
                                    'properties': {
                                        'type': {
                                            'enum': [
                                                'nouns',
                                                'intransitive_verb',
                                                'transitive_verb'
                                            ],
                                            'type': 'string'
                                        },
                                        'content': {
                                            'type': 'string',
                                            'maxLength': 20
                                        }
                                    }
                                }
                            },
                            'numberOfSentence': {
                                'type': 'integer',
                                'minimum': 1,
                                'multipleOf': 1
                            }
                        }
                    },
                    'uischema': {
                        'type': 'VerticalLayout',
                        'elements': [
                            {
                                'type': 'Control',
                                'label': 'Number of sentence',
                                'scope': '#/properties/numberOfSentence'
                            },
                            {
                                'type': 'Control',
                                'label': 'Sentence parameters',
                                'scope': '#/properties/parameters'
                            }
                        ]
                    }
                },
                imageName: 'sentence-generator:latest'
            });

            console.log(`Creating ${mongle.username}:upscaling-with-imagemagick`);
            await PlatformAPI.uploadModelWithImage({
                price: 100,
                regionName: mainRegion.name,
                modelName: 'Upscaling with ImageMagick',
                description: '# Upscaling with ImageMagick \n\n https://imagemagick.org\\n\\nImageMagick Tool을 이용한 Bicubic 업스케일링 모델입니다.',
                inputType: ModelInputType.IMAGE,
                outputType: ModelOutputType.IMAGE,
                category: 'Super Resolution',
                parameters: {
                    'schema': {
                        'properties': {
                            'upscalingFactor': {
                                'type': 'number',
                                'enum': [
                                    25,
                                    50,
                                    100,
                                    125,
                                    150,
                                    200,
                                    300,
                                    400
                                ]
                            },
                            'debugLog': {
                                'type': 'boolean'
                            }
                        }
                    },
                    'uischema': {
                        'type': 'VerticalLayout',
                        'elements': [
                            {
                                'type': 'Control',
                                'label': 'Upscaling factor (%)',
                                'scope': '#/properties/upscalingFactor'
                            },
                            {
                                'type': 'Control',
                                'label': 'Debug log',
                                'scope': '#/properties/debugLog'
                            }
                        ]
                    },
                    'data': {
                        'upscalingFactor': 200,
                        'debugLog': true
                    }
                },
                imageName: 'upscaling-imagemagick:latest'
            });

            console.log(`Creating ${mongle.username}:ai-upscaling`);
            await PlatformAPI.uploadModelWithImage({
                regionName: subRegion.name,
                modelName: 'AI Upscaling',
                description: '# AI Upscaling \n\n 신경망을 이용한 업스케일링 모델입니다.\n' +
                    ' - SwinIR: 기본 SwinIR 구조를 사용하는 업스케일링 모델입니다.\n' +
                    ' - CCTV 학습 모델 (SwinIR_GAN_CCTV): 공원과 바닷가의 CCTV 이미지들을 중점으로 학습한 모델로, CCTV 이미지의 특징인 위에서 아래로 내려다보는 구도의 이미지에 대하여 높은 품질을 기대할 수 있습니다.\n' +
                    ' - 블랙박스 학습 모델 (SwinIR_GAN_Blackbox): 자동차의 블랙박스 이미지들을 중점으로 학습한 모델로, 도로 환경의 이미지에 대하여 높은 품질을 기대할 수 있습니다.\n' +
                    ' - 일반 학습 모델 (HAT): 일반적인 이미지들을 이용하여 학습한 모델로, 범용적으로 일반적인 이미지에 대하여 높은 품질을 기대할 수 있습니다.',
                inputType: ModelInputType.IMAGE,
                outputType: ModelOutputType.IMAGE,
                parameters: {
                    schema: {
                        'type': 'object',
                        'properties': {
                            'model': {
                                'type': 'string',
                                'default': 'SwinIR',
                                'enum': [
                                    'SwinIR',
                                    'SwinIR_GAN_CCTV',
                                    'SwinIR_GAN_Blackbox',
                                    'HAT'
                                ]
                            }
                        }
                    }, uischema: {
                        'type': 'VerticalLayout',
                        'elements': [
                            {
                                'type': 'Control',
                                'scope': '#/properties/model'
                            }
                        ]
                    }, data: {
                        'model': 'SwinIR'
                    }
                },
                imageName: 'upscaling-ai',
                category: 'Super Resolution',
                price: 200
            });

            console.log(`Creating ${mongle.username}:stable-diffusion`);
            await PlatformAPI.uploadModelWithImage({
                regionName: subRegion.name,
                modelName: 'Stable Diffusion',
                description: '# Stable Diffusion\n' +
                    '*Stable Diffusion was made possible thanks to a collaboration with [Stability AI](https://stability.ai/) and [Runway](https://runwayml.com/) and builds upon our previous work:*\n' +
                    '\n' +
                    '[**High-Resolution Image Synthesis with Latent Diffusion Models**](https://ommer-lab.com/research/latent-diffusion-models/)<br/>\n' +
                    '[Robin Rombach](https://github.com/rromb)\\*,\n' +
                    '[Andreas Blattmann](https://github.com/ablattmann)\\*,\n' +
                    '[Dominik Lorenz](https://github.com/qp-qp)\\,\n' +
                    '[Patrick Esser](https://github.com/pesser),\n' +
                    '[Björn Ommer](https://hci.iwr.uni-heidelberg.de/Staff/bommer)<br/>\n' +
                    '_[CVPR \'22 Oral](https://openaccess.thecvf.com/content/CVPR2022/html/Rombach_High-Resolution_Image_Synthesis_With_Latent_Diffusion_Models_CVPR_2022_paper.html) |\n' +
                    '[GitHub](https://github.com/CompVis/latent-diffusion) | [arXiv](https://arxiv.org/abs/2112.10752) | [Project page](https://ommer-lab.com/research/latent-diffusion-models/)_\n' +
                    '\n' +
                    '![txt2img-stable2](https://github.com/Koreatech-Mongle/chameleon-platform/assets/87463004/ba198528-592b-446f-bfd2-ea962cc727c5)\n' +
                    '[Stable Diffusion](#stable-diffusion-v1) is a latent text-to-image diffusion\n' +
                    'model.\n' +
                    'Thanks to a generous compute donation from [Stability AI](https://stability.ai/) and support from [LAION](https://laion.ai/), we were able to train a Latent Diffusion Model on 512x512 images from a subset of the [LAION-5B](https://laion.ai/blog/laion-5b/) database. \n' +
                    'Similar to Google\'s [Imagen](https://arxiv.org/abs/2205.11487), \n' +
                    'this model uses a frozen CLIP ViT-L/14 text encoder to condition the model on text prompts.\n' +
                    'With its 860M UNet and 123M text encoder, the model is relatively lightweight and runs on a GPU with at least 10GB VRAM.\n' +
                    'See [this section](#stable-diffusion-v1) below and the [model card](https://huggingface.co/CompVis/stable-diffusion).',
                inputType: ModelInputType.EMPTY,
                outputType: ModelOutputType.ZIP_GALLERY,
                category: 'Stable Diffusion',
                parameters: {
                    schema: {
                        'type': 'object',
                        'properties': {
                            'prompt': {
                                'type': 'string',
                                'description': 'Enter a description of the image you want to create.'
                            },
                            'ddim_steps': {
                                'type': 'number',
                                'description': 'Number of sampling steps in the Diffusion process.',
                                'minimum': 1,
                                'maximum': 500,
                            },
                            'n_iter': {
                                'type': 'integer',
                                'description': 'A count of how many times to repeat image creation.',
                                'minimum': 1,
                                'maximum': 10,
                            },
                            'H': {
                                'type': 'number',
                                'description': 'Height',
                                'minimum': 256,
                                'maximum': 1024,
                                'enum': [256, 512, 1024]
                            },
                            'W': {
                                'type': 'number',
                                'description': 'Width',
                                'minimum': 256,
                                'maximum': 1024,
                                'enum': [256, 512, 1024]
                            },
                            'scale': {
                                'type': 'number',
                            },
                            'seed': {
                                'type': 'number',
                            }
                        }
                    },

                    uischema: {
                        'type': 'VerticalLayout',
                        'elements': [{'type': 'Control', 'scope': '#/properties/prompt'}, {
                            'type': 'Control',
                            'scope': '#/properties/H'
                        }, {'type': 'Control', 'scope': '#/properties/W'}, {
                            'type': 'Control',
                            'scope': '#/properties/n_iter'
                        }, {'type': 'Control', 'scope': '#/properties/seed'}, {
                            'type': 'Control',
                            'scope': '#/properties/ddim_steps'
                        }, {'type': 'Control', 'scope': '#/properties/scale'}]
                    },
                    data: {
                        'ddim_steps': 50,
                        'H': 512,
                        'n_iter': 1,
                        'W': 512,
                        'scale': 7.5,
                        'seed': 42
                    }
                },
                imageName: 'stable-diffusion',
                price: Math.floor(Math.random() * 1000 + 100)
            });

            await PlatformAPI.uploadModelWithImage({
                regionName: mainRegion.name,
                modelName: 'Compare Upscaling Models',
                description: '# Compare Upscaling Models\n' +
                    '플랫폼에 있는 여러 업스케일링 모델의 출력값을 비교하여 차이 이미지를 생성하고, PSNR(최대 신호 대 잡음비)과 SSIM(구조적 유사 지수)를 출력합니다.\n' +
                    '\n' +
                    '지원 모델 (upscaling-with-imagemagick, upscaling-ai 모델 사용)\n' +
                    ' - Bicubic: 쌍삼차 보간을 이용하는 업스케일링 모델입니다.\n' +
                    ' - SwinIR: 기본 SwinIR 구조를 사용하는 업스케일링 모델입니다.\n' +
                    ' - CCTV 학습 모델 (SwinIR_GAN_CCTV): 공원과 바닷가의 CCTV 이미지들을 중점으로 학습한 모델로, CCTV 이미지의 특징인 위에서 아래로 내려다보는 구도의 이미지에 대하여 높은 품질을 기대할 수 있습니다.\n' +
                    ' - 블랙박스 학습 모델 (SwinIR_GAN_Blackbox): 자동차의 블랙박스 이미지들을 중점으로 학습한 모델로, 도로 환경의 이미지에 대하여 높은 품질을 기대할 수 있습니다.\n' +
                    ' - 일반 학습 모델 (HAT): 일반적인 이미지들을 이용하여 학습한 모델로, 범용적으로 일반적인 이미지에 대하여 높은 품질을 기대할 수 있습니다.',
                cacheSize: 0,
                inputType: ModelInputType.IMAGE,
                outputType: ModelOutputType.HTML,
                category: 'Compare Tool',
                parameters: {
                    'data': {
                        'models': [{
                            'name': 'SwinIR'
                        }]
                    },
                    'schema': {
                        'properties': {
                            'models': {
                                'type': 'array',
                                'items': {
                                    'type': 'object',
                                    'properties': {
                                        'name': {
                                            'enum': [
                                                'SwinIR',
                                                'SwinIR_GAN_CCTV',
                                                'SwinIR_GAN_Blackbox',
                                                'HAT',
                                                'Bicubic'
                                            ],
                                            'type': 'string'
                                        }
                                    }
                                }
                            },
                        }
                    },
                    'uischema': {
                        'type': 'VerticalLayout',
                        'elements': [{
                            'type': 'Control',
                            'label': 'Compare models',
                            'scope': '#/properties/models'
                        }]
                    }
                },
                imageName: 'compare-upscaling-models',
                price: Math.floor(Math.random() * 1000 + 100)
            });

            await PlatformAPI.signIn('test@test.com', 'test');
            for (const dummy of dummies) {
                console.log(`Creating ${dummy.modelName}`);
                await PlatformAPI.uploadModelWithImage({
                    regionName: mainRegion.name,
                    modelName: dummy.modelName,
                    description: dummy.description,
                    inputType: dummy.inputType,
                    outputType: dummy.outputType,
                    category: dummy.category,
                    parameters: emptyParameters,
                    file: (await PlatformAPI.instance.get(`http://files.chameleon.best/images/simple-output-${dummy.outputType}.tar`, {
                        responseType: 'stream'
                    })).data,
                    price: Math.floor(Math.random() * 1000 + 100)
                });
            }
        } catch (e) {
            console.error(e);
            fail(e.response.data);
        }
    }, 60 * 60 * 1000);
    test('Add images V2', async () => {
        /* empty */
    }, 60 * 60 * 1000);
});
