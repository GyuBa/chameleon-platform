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

const initConfig = JSON.parse(fs.readFileSync('initialize.json', 'utf-8'));
const mainRegion = new Region();
mainRegion.name = initConfig.mainRegion.name;
mainRegion.host = initConfig.mainRegion.host;
mainRegion.port = initConfig.mainRegion.port;
mainRegion.cacheSize = initConfig.mainRegion.cacheSize;

const subRegion = new Region();
subRegion.name = initConfig.subRegion.name;
subRegion.host = initConfig.subRegion.host;
subRegion.port = initConfig.subRegion.port;
subRegion.cacheSize = initConfig.subRegion.cacheSize;

const dummyRegion = new Region();
dummyRegion.name = 'dummy';
dummyRegion.host = mainRegion.host;
dummyRegion.port = mainRegion.port;
dummyRegion.cacheSize = mainRegion.cacheSize;

const dummies = [{
    modelName: "Text Summarization",
    description: "# Text Summarization \n\n 이 모델은 BERT 기반으로 긴 텍스트를 짧게 요약하는 인공지능 모델입니다.",
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.TEXT,
    category: "Natural Language Processing"
}, {
    modelName: "Image Classification",
    description: "# Image Classification \n\n 이 모델은 Convolutional Neural Network를 사용하여 이미지를 분류하는 인공지능 모델입니다.",
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.TEXT,
    category: "Image Processing"
}, {
    modelName: "Speech Recognition",
    description: "# Speech Recognition \n\n 이 모델은 음성을 텍스트로 변환하는 인공지능 모델입니다.",
    inputType: ModelInputType.SOUND,
    outputType: ModelOutputType.TEXT,
    category: "Speech Processing"
}, {
    modelName: "Video Object Detection",
    description: "# Video Object Detection \n\n 이 모델은 YOLO 알고리즘을 이용하여 비디오에서 객체를 탐지하는 인공지능 모델입니다.",
    inputType: ModelInputType.VIDEO,
    outputType: ModelOutputType.VIDEO,
    category: "Video Processing"
}, {
    modelName: "Image Colorization",
    description: "# Image Colorization \n\n 이 모델은 흑백 이미지를 컬러로 변환하는 인공지능 모델입니다.",
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.IMAGE,
    category: "Image Processing"
}, {
    modelName: "Sentiment Analysis",
    description: "# Sentiment Analysis \n\n 이 모델은 텍스트에서 감정을 분석하는 인공지능 모델입니다.",
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.TEXT,
    category: "Natural Language Processing"
}, {
    modelName: "Sound Generation",
    description: "# Sound Generation \n\n 이 모델은 텍스트를 소리로 변환하는 인공지능 모델입니다.",
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.SOUND,
    category: "Speech Processing"
}, {
    modelName: "Pose Estimation",
    description: "# Pose Estimation \n\n 이 모델은 이미지 또는 비디오에서 인간의 자세를 추정하는 인공지능 모델입니다.",
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.IMAGE,
    category: "Image Processing"
}, {
    modelName: "Music Generation",
    description: "# Music Generation \n\n 이 모델은 인공지능을 이용해 새로운 음악을 생성합니다.",
    inputType: ModelInputType.EMPTY,
    outputType: ModelOutputType.SOUND,
    category: "Sound Processing"
}, {
    modelName: "Chatbot",
    description: "# Chatbot \n\n 이 모델은 사용자의 질문에 대해 자연스러운 답변을 생성하는 인공지능 모델입니다.",
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.TEXT,
    category: "Natural Language Processing"
}, {
    modelName: "Image Compression",
    description: "# Image Compression \n\n 이 모델은 이미지를 효과적으로 압축하는 인공지능 모델입니다.",
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.BINARY,
    category: "Image Processing"
}, {
    modelName: "Speech-to-Text",
    description: "# Speech-to-Text \n\n 이 모델은 오디오 스피치를 텍스트로 변환하는 인공지능 모델입니다.",
    inputType: ModelInputType.SOUND,
    outputType: ModelOutputType.TEXT,
    category: "Speech Processing"
}, {
    modelName: "Object Segmentation",
    description: "# Object Segmentation \n\n 이 모델은 이미지에서 개체를 분할하고 분류하는 인공지능 모델입니다.",
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.IMAGE,
    category: "Image Processing"
}, {
    modelName: "Text-to-Speech",
    description: "# Text-to-Speech \n\n 이 모델은 텍스트를 사람처럼 말하는 소리로 변환하는 인공지능 모델입니다.",
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.SOUND,
    category: "Speech Processing"
}, {
    modelName: "Facial Recognition",
    description: "# Facial Recognition \n\n 이 모델은 사진이나 비디오에서 얼굴을 인식하는 인공지능 모델입니다.",
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.TEXT,
    category: "Image Processing"
}, {
    modelName: "Machine Translation",
    description: "# Machine Translation \n\n 이 모델은 한 언어의 텍스트를 다른 언어로 번역하는 인공지능 모델입니다.",
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.TEXT,
    category: "Natural Language Processing"
}, {
    modelName: "Handwriting Recognition",
    description: "# Handwriting Recognition \n\n 이 모델은 손글씨 텍스트를 디지털 텍스트로 변환하는 인공지능 모델입니다.",
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.TEXT,
    category: "Image Processing"
}, {
    modelName: "Voice Cloning",
    description: "# Voice Cloning \n\n 이 모델은 주어진 음성 샘플로부터 음성을 복제하는 인공지능 모델입니다.",
    inputType: ModelInputType.SOUND,
    outputType: ModelOutputType.SOUND,
    category: "Speech Processing"
}, {
    modelName: "Keyword Extraction",
    description: "# Keyword Extraction \n\n 이 모델은 주어진 텍스트에서 핵심 키워드를 추출하는 인공지능 모델입니다.",
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.TEXT,
    category: "Natural Language Processing"
}, {
    modelName: "Optical Character Recognition",
    description: "# Optical Character Recognition \n\n 이 모델은 이미지에서 텍스트를 인식하여 디지털 텍스트로 변환하는 인공지능 모델입니다.",
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.TEXT,
    category: "Image Processing"
}, {
    modelName: "Video Frame Interpolation",
    description: "# Video Frame Interpolation \n\n 이 모델은 비디오 프레임 사이를 채워서 비디오의 부드러움을 높이는 인공지능 모델입니다.",
    inputType: ModelInputType.VIDEO,
    outputType: ModelOutputType.VIDEO,
    category: "Video Processing"
}, {
    modelName: "Topic Modelling",
    description: "# Topic Modelling \n\n 이 모델은 주어진 텍스트의 주제를 분석하고 분류하는 인공지능 모델입니다.",
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.TEXT,
    category: "Natural Language Processing"
}, {
    modelName: "Image Style Transfer",
    description: "# Image Style Transfer \n\n 이 모델은 한 이미지의 스타일을 다른 이미지로 전송하는 인공지능 모델입니다.",
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.IMAGE,
    category: "Image Processing"
}, {
    modelName: "Emotion Detection",
    description: "# Emotion Detection \n\n 이 모델은 텍스트나 음성에서 감정을 판단하는 인공지능 모델입니다.",
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.TEXT,
    category: "Natural Language Processing"
}, {
    modelName: "Image Deblurring",
    description: "# Image Deblurring \n\n 이 모델은 이미지에서 흐림을 제거하는 인공지능 모델입니다.",
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.IMAGE,
    category: "Image Processing"
}, {
    modelName: "Audio Noise Reduction",
    description: "# Audio Noise Reduction \n\n 이 모델은 오디오에서 노이즈를 제거하는 인공지능 모델입니다.",
    inputType: ModelInputType.SOUND,
    outputType: ModelOutputType.SOUND,
    category: "Sound Processing"
}, {
    modelName: "Automatic Captioning",
    description: "# Automatic Captioning \n\n 이 모델은 이미지 또는 비디오에 대한 캡션을 자동으로 생성하는 인공지능 모델입니다.",
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.TEXT,
    category: "Multimedia Processing"
}, {
    modelName: "Document Layout Analysis",
    description: "# Document Layout Analysis \n\n 이 모델은 문서의 레이아웃을 분석하여 텍스트, 이미지, 표 등의 위치를 파악하는 인공지능 모델입니다.",
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.TEXT,
    category: "Document Processing"
}, {
    modelName: "Text Generation",
    description: "# Text Generation \n\n 이 모델은 주어진 텍스트에 이어질 새로운 텍스트를 생성하는 인공지능 모델입니다.",
    inputType: ModelInputType.TEXT,
    outputType: ModelOutputType.TEXT,
    category: "Natural Language Processing"
}, {
    modelName: "Scene Recognition",
    description: "# Scene Recognition \n\n 이 모델은 이미지나 비디오의 씬을 인식하고 분류하는 인공지능 모델입니다.",
    inputType: ModelInputType.IMAGE,
    outputType: ModelOutputType.TEXT,
    category: "Image Processing"
}
];
const exampleParameters = {
    'uischema': {
        'type': 'VerticalLayout',
        'elements': [{'type': 'Control', 'scope': '#/properties/name'}]
    }, 'schema': {'type': 'object', 'properties': {'name': {'type': 'string'}}}, 'data': {}
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
            const image = await docker.getImage(model.image.uniqueId);
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
            regionName: 'mongle',
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
                regionName: 'mongle',
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
                regionName: 'mongle',
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
                regionName: 'mongle',
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
                regionName: 'mongle',
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
                regionName: 'mongle',
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

            console.log('Creating test6:zip-input-model');
            await PlatformAPI.signIn('test6@test.com', 'test');
            await PlatformAPI.uploadModelWithImage({
                regionName: 'mongle',
                modelName: 'Zip Input Model',
                description: '# Empty Model \n\n 여러개의 파일을 받는 모델입니다.',
                inputType: ModelInputType.ZIP,
                outputType: ModelOutputType.BINARY,
                parameters: exampleParameters,
                file: (await PlatformAPI.instance.get('http://files.chameleon.best/images/simple-output-image.tar', {
                    responseType: 'stream'
                })).data
            });

            await PlatformAPI.executeModel({
                modelId: (await PlatformAPI.getModelByUsernameAndUniqueName('test6', 'zip-input-model')).id,
                parameters: exampleParameters.data,
                input: (await PlatformAPI.instance.get('http://files.chameleon.best/samples/text.txt', {
                    responseType: 'stream'
                })).data
            });

            await PlatformAPI.signIn('test@test.com', 'test');
            for (const dummy of dummies) {
                console.log(`Creating ${dummy.modelName}`);
                await PlatformAPI.uploadModelWithImage({
                    regionName: 'mongle',
                    modelName: dummy.modelName,
                    description: dummy.description,
                    inputType: dummy.inputType,
                    outputType: dummy.outputType,
                    category: dummy.category,
                    parameters: {uischema: {}, schema: {}, data: {}},
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

        console.log('Creating test7:image-captioning');
        await PlatformAPI.signIn('test7@test.com', 'test');
        await PlatformAPI.uploadModelWithImage({
            regionName: 'mongle',
            modelName: 'Image Captioning',
            description: '# Image Captioning \n\n 이미지를 묘사하는 텍스트를 생성하는 모델입니다',
            inputType: ModelInputType.IMAGE,
            outputType: ModelOutputType.IMAGE,
            category: 'Image Processing',
            parameters: {uischema: {}, data: {}, schema: {}},
            file: (await PlatformAPI.instance.get('http://files.chameleon.best/images/image-captioning.tar', {
                responseType: 'stream'
            })).data
        });
    }, 60 * 60 * 1000);
});
