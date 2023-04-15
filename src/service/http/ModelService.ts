import * as express from 'express';
import {Application, Request, Response} from 'express';
import * as Dockerode from 'dockerode';
import {DIR_PATH_UPLOADED_IMAGE, RESPONSE_MESSAGE} from '../../constant/Constants';
import {Region} from '../../entities/Region';
import {Image} from '../../entities/Image';
import {Model} from '../../entities/Model';
import {HTTPService} from '../interfaces/http/HTTPService';
import {Server} from 'http';

export class ModelService extends HTTPService {
    init(app: Application, server: Server) {
        const router = express.Router();
        router.post('/upload', this.handleUpload);
        router.get('/list', this.handleList);
        router.get('/info', this.handleModel);
        router.put('/update', this.handleUpdate);
        router.put('/execute', this.handleExecute);
        app.use('/model', router);
    }

    async handleExecute(req: Request, res: Response, next: Function) {
        if (!req.isAuthenticated()) res.status(401).send(RESPONSE_MESSAGE.NOT_AUTH);
        const modelId = req.body.modelId;
        const model = await this.modelController.findModelById(modelId);
        if (!model) res.status(401).send(RESPONSE_MESSAGE.WRONG_INFO);
        const image = model.image;
        /* const docker = new Dockerode(region);
        docker.createImage() */
    }

    async handleList(req: Request, res: Response, next: Function) {
        if (!req.isAuthenticated()) return res.status(401).send(RESPONSE_MESSAGE.NOT_AUTH);
        const result = await this.modelController.getAllModel();
        const responseData = result.map((model) => {
            const {id, updatedTime, uniqueName, name: modelName, inputType, outputType} = model;
            const {username} = model.register;
            const regionName = model.image?.region.name;
            return {id, updatedTime, uniqueName, modelName, inputType, outputType, username, regionName};
        })
        return res.status(200).send(responseData);
    }

    async handleModel(req: Request, res: Response, next: Function) {
        if (!req.isAuthenticated()) return res.status(401).send(RESPONSE_MESSAGE.NOT_AUTH);
        const {uniqueName: inputUniqueName} = req.body;
        if (!inputUniqueName) return res.status(401).send(RESPONSE_MESSAGE.NON_FIELD);

        try {
            const result = await this.modelController.findModelByUniqueName(inputUniqueName);
            const {id, createdTime, updatedTime, uniqueName, description, name: modelName, inputType, outputType, parameter} = result;
            const {username} = result.register;
            const {name: regionName} = result.image?.region;
            if (!result) return res.status(404).send(RESPONSE_MESSAGE.NOT_FOUND);
            else return res.status(200).send({
                id,
                createdTime,
                updatedTime,
                username,
                modelName,
                regionName,
                uniqueName,
                description,
                inputType,
                outputType,
                parameter
            });
        } catch (e) {
            console.error(e);
            return res.status(501).send(RESPONSE_MESSAGE.SERVER_ERROR);
        }
    }
    async uploadImage(req: Request, res: Response, next: Function) {
        const uploadFile = req.files.file;
        if ('mv' in uploadFile) {
            const path = 'uploads/' + uploadFile.name;
            await uploadFile?.mv(
                path,
                function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
            return path;
        }
        return '';
    }

    async handleUpdate(req: Request, res: Response, next: Function) {
        const {modelId, repository, modelName, description, inputType, outputType} = req.body;

        if (!(modelId && repository && modelName && description && inputType && outputType))
            return res.status(401).send(RESPONSE_MESSAGE.NON_FIELD);
        try {
            const prevModel = await this.modelController.findModelById(modelId);
            await this.modelController.updateModel(modelId, {name: modelName, inputType, outputType, description});
            await this.imageController.updateImage(prevModel.image.id, {repository});
        } catch (e) {
            console.error(e);
            return res.status(501).send(RESPONSE_MESSAGE.SERVER_ERROR);
        }

        return res.status(200).send(RESPONSE_MESSAGE.OK);
    }

    async deleteModel(req: Request, res: Response, next: Function) {
        const {modelId, imageId} = req.body;

        if (!(modelId && imageId)) return res.status(401).send(RESPONSE_MESSAGE.NON_FIELD);
        if (!req.isAuthenticated()) return res.status(401).send(RESPONSE_MESSAGE.NOT_AUTH);

        try {
            await this.modelController.deleteModel(modelId);
            await this.imageController.deleteImage(imageId);
        } catch (e) {
            console.error(e);
            return res.status(501).send(RESPONSE_MESSAGE.SERVER_ERROR);
        }

        return res.status(200).send(RESPONSE_MESSAGE.OK);
    }

    async toPermalLink(repository: string, tag: string) {
        try {
            const tagName = tag.toLowerCase().replace(/ /g,'-');
            const repositoryName = repository.toLowerCase();
            const result = await this.imageController.findImageLikeTag(repositoryName, tagName);

            if(result.length == 0) {
                return tagName;
            } else {
                const lastIndex: number = await this.getLastIndex(repositoryName, tagName);
                return tagName + '-' + (Number(lastIndex) + 1).toString();
            }
        } catch (e) {
            console.error(e);
        }
    }
    //함수 2개 요약 필요 getLastIndex, toPermalLink
    async getLastIndex(repository: string, tag: string) {
        const imageList = await this.imageController.findImageLikeTag(repository, tag);
        const lastImage = imageList[imageList.length - 1];
        if(tag.length == lastImage.tag.length) return 0;
        else {
            const newTag = lastImage.tag;
            const result = newTag.slice(tag.length + 1, newTag.length)
            return parseInt(result? result:'0');
        }
    }

    async handleUpload(req: Request, res: Response, next: Function) {
        const {regionName, modelName, description, inputType, outputType, parameter} = req.body;
        if (!(regionName && modelName && description && inputType && outputType && req.files.file && parameter)) return res.status(501).send(RESPONSE_MESSAGE.NON_FIELD);
        if (!(req.isAuthenticated())) return res.status(501).send(RESPONSE_MESSAGE.NOT_AUTH);

        const region: Region = await this.regionController.findRegionByName(regionName);
        if(!region) return res.status(501).send(RESPONSE_MESSAGE.REG_NOT_FOUND);

        const path = await this.uploadImage(req, res, next);
        const docker = new Dockerode({host: region.host, port:region.port});

        const imageInput: Image = new Image();
        const imageName: string = await this.toPermalLink(req.user['username'], modelName);

        try {
            await docker.importImage(path, {repo: req.user['username'].toLowerCase(), tag: imageName});
        } catch (e) {
            console.error(e);
            res.status(501).send(RESPONSE_MESSAGE.SERVER_ERROR);
        }

        imageInput.repository = req.user['username'].toLowerCase();
        imageInput.tag = imageName;
        const insertedImage = await docker.getImage(req.user['username'].toLowerCase() + ':' + imageName);
        imageInput.uniqueId = ((await insertedImage.inspect()).Id);
        // console.log(imageInput.uniqueId);
        const image = await this.imageController.createImage(imageInput, region);

        const model: Model = new Model();
        model.name = modelName;
        model.description = description;
        model.inputType = inputType;
        model.outputType = outputType;
        model.image = image;
        model.register = await this.userController.findUserById(req.user['id'] as number);
        model.uniqueName = imageName;
        model.parameter = parameter;
        await this.modelController.createModel(model);
        // TODO: as 처리 깔끔하게
        // console.log(await findModelByImage(image));

        // console.log(await docker.getImage(imageInput.repository + ':' + imageInput.tag).inspect());
        return res.status(200).send(RESPONSE_MESSAGE.OK);
    }
}
