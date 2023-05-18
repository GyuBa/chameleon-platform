import * as express from 'express';
import {Application, Request, Response} from 'express';
import * as Dockerode from 'dockerode';
import {Region} from '../../entities/Region';
import {Image} from '../../entities/Image';
import {Model} from '../../entities/Model';
import {HTTPService} from '../interfaces/http/HTTPService';
import {Server} from 'http';
import {DockerUtils} from '../../utils/DockerUtils';
import * as multer from 'multer';
import {MulterUtils} from '../../utils/MulterUtils';
import {User} from '../../entities/User';
import {HTTPLogUtils} from '../../utils/HTTPLogUtils';
import {HistoryStatus, ResponseData} from '../../types/chameleon-platform.common';
import * as fs from 'fs';
import {DateUtils} from '../../utils/DateUtils';

const images = multer({fileFilter: MulterUtils.fixNameEncoding, dest: 'uploads/images'});
const inputs = multer({fileFilter: MulterUtils.fixNameEncoding, dest: 'uploads/inputs'});
const dockerfiles = multer({
    fileFilter: MulterUtils.fixNameEncoding, dest: 'uploads/dockerfiles', storage: multer.diskStorage({
        destination: function (req, file, callback) {
            const request: Request & { requestTime?: number } = req as any;
            if (!request.requestTime) {
                request.requestTime = new Date().getTime();
                fs.mkdirSync(`uploads/dockerfiles/${request.requestTime}/`, {recursive: true});
            }
            callback(null, `uploads/dockerfiles/${request.requestTime}/`);
        },
        filename: function (req, file, callback) {
            callback(null, file.originalname);
        }
    })
});

export class ModelService extends HTTPService {

    init(app: Application, server: Server) {
        const router = express.Router();
        router.post('/upload-image', images.single('file'), HTTPLogUtils.addBeginLogger(this.handleUpload, '/models/upload-image'));
        router.post('/upload-dockerfile', dockerfiles.array('files'), HTTPLogUtils.addBeginLogger(this.handleUpload, '/models/upload-dockerfile'));
        router.post('/execute', inputs.single('input'), HTTPLogUtils.addBeginLogger(this.handleExecute, '/models/execute'));
        router.put('/update', HTTPLogUtils.addBeginLogger(this.handleUpdate, '/models/update'));
        router.get('/name/:nameId', HTTPLogUtils.addBeginLogger(this.handleGetModelByNameId, '/models/name/:nameId'));
        router.delete('/delete/:modelId', HTTPLogUtils.addBeginLogger(this.handleDeleteModel, '/models/delete/:modelId'));
        router.get('/:id', HTTPLogUtils.addBeginLogger(this.handleGetModelById, '/models/:id'));
        router.get('/', HTTPLogUtils.addBeginLogger(this.handleGetModels, '/models'));
        app.use('/models', router);
    }

    async handleExecute(req: Request, res: Response, next: Function) {
        if (!req.isAuthenticated()) res.status(401).send({msg: 'not_authenticated_error'} as ResponseData);
        const {parameters: rawParameters, modelId} = req.body;
        if (!(rawParameters && modelId && req.file)) return res.status(501).send({msg: 'non_field_error'} as ResponseData);
        const parameters = JSON.parse(rawParameters);
        const executor: User = req.user as User;
        const model: Model = await this.modelController.findById(modelId);

        if (!model) return res.status(401).send({
            msg: 'wrong_information_error',
            reason: 'Model does not exist.'
        } as ResponseData);

        if (executor.point - model.price < 0) {
            return res.status(401).send({
                msg: 'wrong_permission_error',
                reason: 'Not enough points to use.'
            } as ResponseData);
        }
        executor.point -= model.price;
        await this.userController.save(executor);

        const file = req.file;
        setTimeout(async () => {
            await this.modelExecutionManager.executeModel(model, {
                parameters, executor, inputPath: file.path, inputInfo: {
                    fileName: file.originalname,
                    mimeType: file.mimetype,
                    fileSize: file.size
                }
            });
        });

        return res.status(200).send({msg: 'ok'});
    }

    async handleGetModels(req: Request, res: Response, next: Function) {
        if (!req.isAuthenticated()) return res.status(401).send({msg: 'not_authenticated_error'} as ResponseData);
        const ownOnly = req.query.ownOnly === 'true';
        const user = req.user as User;
        const responseData = (ownOnly ? await this.modelController.findAllByUserId(user.id) : await this.modelController.getAll()).map(m => m.toData());
        return res.status(200).send(responseData);
    }

    async handleGetModelById(req: Request, res: Response, next: Function) {
        if (!req.isAuthenticated()) return res.status(401).send({msg: 'not_authenticated_error'} as ResponseData);
        const id = req.params?.id;
        if (!id || Number.isNaN(id)) return res.status(401).send({msg: 'non_field_error'} as ResponseData);
        try {
            const modelResult = await this.modelController.findById(parseInt(id));
            if (!modelResult) return res.status(404).send({msg: 'not_found_error'} as ResponseData);
            return res.status(200).send(modelResult.toData());
        } catch (e) {
            return res.status(501).send({msg: 'server_error'} as ResponseData);
        }
    }

    async handleGetModelByNameId(req: Request, res: Response, next: Function) {
        if (!req.isAuthenticated()) return res.status(401).send({msg: 'not_authenticated_error'} as ResponseData);
        const nameId = req.params?.nameId;
        if (!nameId) return res.status(401).send({msg: 'non_field_error'} as ResponseData);
        try {
            const [username, uniqueName] = nameId.split(':');
            const modelResult = await this.modelController.findByUsernameAndUniqueName(username, uniqueName);
            if (!modelResult) return res.status(404).send({msg: 'not_found_error'} as ResponseData);
            return res.status(200).send(modelResult.toData());
        } catch (e) {
            return res.status(501).send({msg: 'server_error'} as ResponseData);
        }
    }

    // TODO: 구조 개선
    async handleUpdate(req: Request, res: Response, next: Function) {
        const {modelId, repository, modelName, description, inputType, outputType} = req.body;

        if (!(modelId && repository && modelName && description && inputType && outputType))
            return res.status(401).send({msg: 'non_field_error'} as ResponseData);
        try {
            const prevModel = await this.modelController.findById(modelId);
            prevModel.name = modelName;
            prevModel.inputType = inputType;
            prevModel.outputType = outputType;
            prevModel.description = description;
            prevModel.image.repository = repository;
            await this.modelController.save(prevModel);
            // await this.modelController.updateModel(modelId, {name: modelName, inputType, outputType, description});
            // await this.imageController.updateImage(prevModel.image.id, {repository});
        } catch (e) {
            return res.status(501).send({msg: 'server_error'} as ResponseData);
        }

        return res.status(200).send({msg: 'ok'} as ResponseData);
    }

    /* 테스트 및 검증 필요 */
    async handleDeleteModel(req: Request, res: Response, next: Function) {
        const {modelId} = req.params;

        if (!modelId || Number.isNaN(modelId)) return res.status(401).send({msg: 'non_field_error'} as ResponseData);
        if (!req.isAuthenticated()) return res.status(401).send({msg: 'not_authenticated_error'} as ResponseData);
        const user = req.user as User;

        try {
            const model = await this.modelController.findById(parseInt(modelId));
            if (model.register.id !== user.id) return res.status(401).send({msg: 'wrong_permission_error'} as ResponseData);
            if (this.containerCachingLock.get(model.id)) {
                return res.status(401).send({
                    msg: 'server_error',
                    reason: 'Model is caching. Please try in a while.'
                } as ResponseData);
            }
            const image = model.image;
            const region = image.region;
            const docker = new Dockerode(region);
            const histories = await this.historyController.findAllByModelId(model.id);
            const cachedHistories = histories.filter(h => h.status === HistoryStatus.CACHED);
            const notCachedHistories = histories.filter(h => h.status !== HistoryStatus.CACHED);
            if (histories.some(h => h.status === HistoryStatus.RUNNING || h.status === HistoryStatus.INITIALIZING)) {
                return res.status(401).send({msg: 'server_error', reason: 'Model is still running.'} as ResponseData);
            }
            console.log((`[${DateUtils.getConsoleTime()} | HTTP, ${req.ip}] (Model: ${model.name}) Start model deletion`));
            this.containerCachingLock.set(model.id, true);
            const cachedContainers = await Promise.all(cachedHistories.map(h => docker.getContainer(h.containerId)));
            await Promise.all(cachedContainers.map(c => c.remove()));
            try {
                const dockerImage = await docker.getImage(image.uniqueId);
                await dockerImage.remove({force: true});
            } catch (e) {
                console.error(e);
            }
            await this.imageController.delete(image);
            await Promise.all(cachedHistories.map(h => this.historyController.deleteById(h.id)));
            await Promise.all(notCachedHistories.map(h => {
                h.model = null;
                return this.historyController.save(h);
            }));
            await this.modelController.deleteById(model.id);
            this.containerCachingLock.delete(model.id);
            console.log((`[${DateUtils.getConsoleTime()} | HTTP, ${req.ip}] (Model: ${model.name}) End model deletion`));
        } catch (e) {
            console.error(e);
            return res.status(501).send({msg: 'server_error'} as ResponseData);
        }
        return res.status(200).send({msg: 'ok'} as ResponseData);
    }

    async toPermalink(repository: string, tag: string) {
        const tagName = tag.toLowerCase().replace(/ /g, '-');
        const repositoryName = repository.toLowerCase();
        const result = await this.imageController.findAllByRepositoryAndTagLike(repositoryName, tagName);

        if (result.length == 0) {
            return tagName;
        } else {
            const lastIndex = await this.getLastIndex(repositoryName, tagName);
            return `${tagName}-${lastIndex + 1}`;
        }
    }

    // TODO: 함수 2개 요약 필요 getLastIndex, toPermalink
    async getLastIndex(repository: string, tag: string) {
        const imageList = await this.imageController.findAllByRepositoryAndTagLike(repository, tag);
        const lastImage = imageList[imageList.length - 1];
        if (tag.length == lastImage.tag.length) return 0;
        else {
            const newTag = lastImage.tag;
            const result = newTag.slice(tag.length + 1, newTag.length);
            return result ? parseInt(result) : 0;
        }
    }

    async handleUpload(req: Request, res: Response, next: Function) {
        const {
            regionName,
            modelName,
            description,
            inputType,
            outputType,
            parameters,
            price: rawPrice,
            category: rawCategory
        } = req.body;
        if (!(regionName && modelName && description && inputType && outputType && (req.files || req.file) && parameters)) return res.status(501).send({msg: 'non_field_error'} as ResponseData);
        if (!(req.isAuthenticated())) return res.status(501).send({msg: 'not_authenticated_error'} as ResponseData);

        const region: Region = await this.regionController.findByName(regionName);
        if (!region) return res.status(501).send({msg: 'region_not_found'} as ResponseData);

        const docker = new Dockerode(region);
        const image: Image = new Image();
        const user = req.user as User;
        const username = user.username.toLowerCase();
        const imageTag = await this.toPermalink(username, modelName);

        if (req.file) {
            // Image file
            const file = req.file;
            try {
                await DockerUtils.loadImage(docker, file.path, {repo: username, tag: imageTag});
            } catch (e) {
                console.error(e);
                return res.status(501).send({
                    msg: 'wrong_information_error',
                    reason: 'Wrong image file.'
                } as ResponseData);
            }
            image.path = file.path.replace(/\\/g, '/');
        } else if (req.files) {
            // Dockerfile
            const files = req.files as Express.Multer.File[];
            const context = files[0].destination;
            await docker.buildImage({context, src: files.map(f => f.originalname)}, {t: `${username}:${imageTag}`});
            image.path = context.replace(/\\/g, '/');
        } else {
            return res.status(501).send({msg: 'wrong_information_error', reason: 'Wrong upload type.'} as ResponseData);
        }

        image.repository = username.toLowerCase();
        image.tag = imageTag;
        const insertedImage = await docker.getImage(username + ':' + imageTag);
        image.uniqueId = (await insertedImage.inspect()).Id;
        image.region = region;

        const model: Model = new Model();
        if (!Number.isNaN(rawPrice)) {
            model.price = parseInt(rawPrice);
            model.price = model.price < 0 ? 0 : model.price;
        }
        if (rawCategory) {
            model.category = rawCategory;
        }
        model.name = modelName;
        model.description = description;
        model.inputType = inputType;
        model.outputType = outputType;
        model.image = await this.imageController.save(image);
        model.cacheSize = region.cacheSize;
        model.config = {
            paths: {
                script: '/opt/mctr/run',
                input: '/opt/mctr/i/raw',
                inputInfo: '/opt/mctr/i/info',
                parameters: '/opt/mctr/i/params',
                output: '/opt/mctr/o/raw',
                outputInfo: '/opt/mctr/o/info',
                outputDescription: '/opt/mctr/o/desc',
                controllerDirectory: '/opt/mctr/',
                debugLog: '/dev/null'
            }
        };

        // model-executor의 model configuration 기능 migration
        // TODO: 여유가 있다면 프론트에서 해당 뷰를 만들어야 함, 후순위
        model.parameters = JSON.parse(parameters);

        model.register = req.user as User;
        model.uniqueName = imageTag;
        await this.modelController.save(model);

        setTimeout(() => this.modelExecutionManager.createCachedContainers(docker, model));
        return res.status(200).send({msg: 'ok'} as ResponseData);
    }
}