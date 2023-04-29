import * as express from 'express';
import {Application, Request, Response} from 'express';
import * as Dockerode from 'dockerode';
import {Container} from 'dockerode';
import {RESPONSE_MESSAGE} from '../../constant/Constants';
import {Region} from '../../entities/Region';
import {History} from '../../entities/History';
import {Image} from '../../entities/Image';
import {Model} from '../../entities/Model';
import {HTTPService} from '../interfaces/http/HTTPService';
import {Server} from 'http';
import {DockerUtils} from '../../utils/DockerUtils';
import * as multer from "multer";
import {MulterUtils} from "../../utils/MulterUtils";
import {HistoryStatus} from "../../types/chameleon-platform.enum";

const images = multer({fileFilter: MulterUtils.fixNameEncoding, dest: 'uploads/images'});
const inputs = multer({fileFilter: MulterUtils.fixNameEncoding, dest: 'uploads/inputs'});

export class ModelService extends HTTPService {
    init(app: Application, server: Server) {
        const router = express.Router();
        router.post('/upload', images.single('file'), this.handleUpload);
        router.post('/execute',images.single('inputs'), this.handleExecute);
        router.get('/list', this.handleList);
        router.get('/info', this.handleInfo);
        router.put('/update', this.handleUpdate);
        app.use('/model', router);
    }

    async handleExecute(req: Request, res: Response, next: Function) {
        if (!req.isAuthenticated()) res.status(401).send(RESPONSE_MESSAGE.NOT_AUTH);
        const user = await this.userController.findById(parseInt(req.user['id']));
        const model = await this.modelController.findById(req.body.modelId);
        if (!model) return res.status(401).send({...RESPONSE_MESSAGE.WRONG_INFO, reason: 'Model does not exist.'});
        const image = model.image;
        const region = model.image.region;
        const docker = new Dockerode(region);

        let history: History;
        let container: Container;
        const cachedHistories = await this.historyController.findAllByImageAndStatus(image, HistoryStatus.CACHED);
        if (cachedHistories.length > 0) {
            history = cachedHistories.shift();
            container = await docker.getContainer(history.containerId);
        } else {
            history = new History();
            container = await docker.createContainer({
                Image: image.uniqueId
            });
            history.containerId = container.id;
            await this.historyController.save(history);
            history.model = model;
        }
        history.startedTime = new Date();
        history.status = HistoryStatus.INITIALIZING;
        await this.historyController.save(history);

        setTimeout(() => this.createCachedContainers(docker, model));
        await container.restart();

        // history.status

        return res.status(200).send({msg: 'ok'});
    }

    async handleList(req: Request, res: Response, next: Function) {
        if (!req.isAuthenticated()) return res.status(401).send(RESPONSE_MESSAGE.NOT_AUTH);
        const models = await this.modelController.getAll();
        const responseData = models.map((model) => [
            'id',
            'updatedTime',
            'uniqueName',
            'name',
            'inputType',
            'outputType'
        ].reduce((obj, key) => ({...obj, [key]: model[key]}), {
            username: model.register.username,
            modelName: model.name,
            regionName: model.image.region.name
        }));
        return res.status(200).send(responseData);
    }

    async handleInfo(req: Request, res: Response, next: Function) {
        if (!req.isAuthenticated()) return res.status(401).send(RESPONSE_MESSAGE.NOT_AUTH);
        const {uniqueName: inputUniqueName} = req.body;
        if (!inputUniqueName) return res.status(401).send(RESPONSE_MESSAGE.NON_FIELD);
        try {
            const modelResult = await this.modelController.findModelByUniqueName(inputUniqueName);
            if (!modelResult) return res.status(404).send(RESPONSE_MESSAGE.NOT_FOUND);
            const response = [
                'id',
                'createdTime',
                'updatedTime',
                'uniqueName',
                'description',
                'name',
                'inputType',
                'outputType',
                'parameter'
            ].reduce((obj, key) => ({...obj, [key]: modelResult[key]}), {
                username: modelResult.register.username,
                modelName: modelResult.name,
                regionName: modelResult.image.region.name
            });
            return res.status(200).send(response);
        } catch (e) {
            return res.status(501).send(RESPONSE_MESSAGE.SERVER_ERROR);
        }
    }

    async handleUpdate(req: Request, res: Response, next: Function) {
        const {modelId, repository, modelName, description, inputType, outputType} = req.body;

        if (!(modelId && repository && modelName && description && inputType && outputType))
            return res.status(401).send(RESPONSE_MESSAGE.NON_FIELD);
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
            return res.status(501).send(RESPONSE_MESSAGE.SERVER_ERROR);
        }

        return res.status(200).send(RESPONSE_MESSAGE.OK);
    }

    async deleteModel(req: Request, res: Response, next: Function) {
        const {modelId, imageId} = req.body;

        if (!(modelId && imageId)) return res.status(401).send(RESPONSE_MESSAGE.NON_FIELD);
        if (!req.isAuthenticated()) return res.status(401).send(RESPONSE_MESSAGE.NOT_AUTH);

        try {
            await this.modelController.deleteById(modelId);
            await this.imageController.deleteById(imageId);
        } catch (e) {
            return res.status(501).send(RESPONSE_MESSAGE.SERVER_ERROR);
        }

        return res.status(200).send(RESPONSE_MESSAGE.OK);
    }

    async toPermalink(repository: string, tag: string) {
        const tagName = tag.toLowerCase().replace(/ /g, '-');
        const repositoryName = repository.toLowerCase();
        const result = await this.imageController.findAllImageByRepositoryAndTagLike(repositoryName, tagName);

        if (result.length == 0) {
            return tagName;
        } else {
            const lastIndex = await this.getLastIndex(repositoryName, tagName);
            return `${tagName}-${lastIndex + 1}`;
        }
    }

    //함수 2개 요약 필요 getLastIndex, toPermalLink
    async getLastIndex(repository: string, tag: string) {
        const imageList = await this.imageController.findAllImageByRepositoryAndTagLike(repository, tag);
        const lastImage = imageList[imageList.length - 1];
        if (tag.length == lastImage.tag.length) return 0;
        else {
            const newTag = lastImage.tag;
            const result = newTag.slice(tag.length + 1, newTag.length);
            return result ? parseInt(result) : 0;
        }
    }

    async createCachedContainer(docker: Dockerode, model: Model) {
        const cachedContainer = await docker.createContainer({
            Image: model.image.uniqueId
        });
        const cachedHistory = new History();
        cachedHistory.containerId = cachedContainer.id;
        cachedHistory.status = HistoryStatus.CACHED;
        cachedHistory.model = model;
        return await this.historyController.save(cachedHistory);
    }

    async createCachedContainers(docker: Dockerode, model: Model) {
        const cachedSize = (await this.historyController.findAllByImageAndStatus(model.image, HistoryStatus.CACHED)).length;
        const tasks = Array.from({length: model.cacheSize - cachedSize}, () => this.createCachedContainer(docker, model));
        return await Promise.all(tasks);
    }

    async handleUpload(req: Request, res: Response, next: Function) {
        const {regionName, modelName, description, inputType, outputType, parameters} = req.body;
        if (!(regionName && modelName && description && inputType && outputType && req.file && parameters)) return res.status(501).send(RESPONSE_MESSAGE.NON_FIELD);
        if (!(req.isAuthenticated())) return res.status(501).send(RESPONSE_MESSAGE.NOT_AUTH);

        const region: Region = await this.regionController.findRegionByName(regionName);
        if (!region) return res.status(501).send(RESPONSE_MESSAGE.REG_NOT_FOUND);

        const file = req.file;
        const docker = new Dockerode(region);
        const image: Image = new Image();
        const username = req.user['username'].toLowerCase();
        const imageName: string = await this.toPermalink(username, modelName);

        try {
            await DockerUtils.loadImage(docker, file.path, {repo: username, tag: imageName});
        } catch (e) {
            console.error(e);
            res.status(501).send(RESPONSE_MESSAGE.SERVER_ERROR);
        }

        image.repository = req.user['username'].toLowerCase();
        image.tag = imageName;
        const insertedImage = await docker.getImage(username + ':' + imageName);
        image.uniqueId = (await insertedImage.inspect()).Id;
        image.region = region;
        image.path = file.path;

        const model: Model = new Model();
        model.name = modelName;
        model.description = description;
        model.inputType = inputType;
        model.outputType = outputType;
        model.image = await this.imageController.save(image);
        model.cacheSize = region.cacheSize;
        model.setConfig({
            script: "/opt/mctr/run",
            input: "/opt/mctr/i/raw",
            inputInfo: "/opt/mctr/i/info",
            output: "/opt/mctr/o/raw",
            outputInfo: "/opt/mctr/o/info",
            outputDescription: "/opt/mctr/o/desc",
            controllerPath: "/opt/mctr/",
            debugLog: "/dev/null"
        });
        console.log(model);
        // model-executor의 model configuration 기능 migration
        // TODO: 여유가 있다면 프론트에서 해당 뷰를 만들어야 함, 후순위
        model.setParameters(JSON.parse(parameters));

        const userId = parseInt(req.user['id']);
        model.register = await this.userController.findById(userId);
        model.uniqueName = imageName;
        await this.modelController.save(model);
        // setTimeout(() => this.createCachedContainers(docker, model));
        return res.status(200).send(RESPONSE_MESSAGE.OK);
    }
}
