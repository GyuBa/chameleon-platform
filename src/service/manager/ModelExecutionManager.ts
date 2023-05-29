import {Model} from '../../entities/Model';
import * as Dockerode from 'dockerode';
import {Container} from 'dockerode';
import {History} from '../../entities/History';
import {HistoryStatus} from '../../types/chameleon-platform.common';
import PlatformServer from '../../server/core/PlatformServer';
import {ModelExecutionOptions} from '../../types/chameleon-platform';
import {ServiceManager} from '../interfaces/manager/ServiceManager';
import {DateUtils} from '../../utils/DateUtils';
import {DockerUtils} from '../../utils/DockerUtils';

export class ModelExecutionManager extends ServiceManager {
    async executeModel(model: Model, executionOptions: ModelExecutionOptions): Promise<History> {
        const image = model.image;
        const region = model.image.region;
        const docker = new Dockerode(region);

        let history: History;
        let container: Container;
        const cachedHistory = await this.service.historyController.findAndUseCache(image);
        if (cachedHistory) {
            console.log((`[${DateUtils.getConsoleTime()}] (Model: ${model.name}) Found cached containers`));
            history = cachedHistory;
            container = await docker.getContainer(history.containerId);
            await container.restart();
        } else {
            console.log((`[${DateUtils.getConsoleTime()}] (Model: ${model.name}) No cached containers`));
            const {
                history: newHistory,
                container: newContainer
            } = await this.createCachedContainer(docker, model, true);
            history = newHistory;
            container = newContainer;
        }
        console.log((`[${DateUtils.getConsoleTime()}] (Model: ${model.name}, ContainerId: ${container.id}) container created!`));

        history.modelPrice = model.price;
        history.startedTime = new Date();
        history.executor = executionOptions.executor;
        history.status = HistoryStatus.INITIALIZING;
        history.inputPath = executionOptions.inputPath.replace(/\\/g, '/');
        history.inputInfo = executionOptions.inputInfo;
        history.parameters = executionOptions.parameters;
        if (executionOptions.parent) {
            history.parent = executionOptions.parent;
            history.numberOfParents = history.parent.numberOfParents + 1;
        }
        await this.service.historyController.save(history);
        // TODO: TIMING - INITIALIZING
        let targetSockets = PlatformServer.wsServer.manager.getHistoryRelatedSockets(history, PlatformServer.wsServer.manager.getAuthenticatedSockets());
        PlatformServer.wsServer.manager.sendUpdateHistory(history, targetSockets);
        // PlatformServer.wsServer.manager.
        // targetSockets

        setTimeout(() => this.createCachedContainers(docker, model));
        const {paths} = history.model.config;
        const port = PlatformServer.config.socketExternalPort ? PlatformServer.config.socketExternalPort : PlatformServer.config.socketPort;

        setTimeout(() =>
            DockerUtils.exec(container, `chmod 777 "${paths.controllerDirectory}/controller" && "${paths.controllerDirectory}/controller" ${PlatformServer.config.socketExternalHost} ${port} ${history.id} >> ${paths.debugLog} 2>&1`)
        );

        history.status = HistoryStatus.RUNNING;
        history.startedTime = new Date();
        await this.service.historyController.save(history);
        // TODO: TIMING - RUNNING
        targetSockets = PlatformServer.wsServer.manager.getHistoryRelatedSockets(history, PlatformServer.wsServer.manager.getAuthenticatedSockets());
        PlatformServer.wsServer.manager.sendUpdateHistory(history, targetSockets);
        return history;
    }

    async addControllerToContainer(container: Container, model: Model) {
        const config = model.config;
        const {paths} = config;

        const excludePaths = [paths.script, paths.controllerDirectory, '/dev/null'];
        const clearPaths = Object.values(paths).filter(p => !excludePaths.includes(p)).sort();
        const initCommand = [`mkdir -p ${paths.controllerDirectory}/dependencies`, 'mkdir -p /usr/local/bin', `ln -s ${paths.controllerDirectory}/controller /usr/local/bin/chameleon`, ...clearPaths.map(p => `rm -rf "${p}" && mkdir -p $(dirname "${p}")`)].join(' && ');
        await DockerUtils.exec(container, initCommand);

        const dependencies = model.image.region.useGPU ? Promise.resolve() : container.putArchive(PlatformServer.config.dependenciesPath, {path: '/'});
        const controller = container.putArchive(PlatformServer.config.controllerPath, {path: paths.controllerDirectory});
        await Promise.all([dependencies, controller]);
    }

    async createCachedContainer(docker: Dockerode, model: Model, keepRunning?: boolean) {
        const container = await docker.createContainer({
            Image: model.image.uniqueId,
            Tty: true,
            ...(model.image.region.useGPU ? {
                HostConfig: {
                    DeviceRequests: [{
                        'Driver': 'nvidia',
                        'Count': -1,
                        'Capabilities': [['gpu']],
                        'Options': {},
                    }]
                }
            } : {})
        });
        const history = new History();
        history.containerId = container.id;
        history.status = HistoryStatus.CACHED;
        history.model = model;
        history.inputType = model.inputType;
        history.outputType = model.outputType;

        await container.start();
        await this.addControllerToContainer(container, model);
        if (!keepRunning) {
            await container.stop();
        }
        await this.service.historyController.save(history);
        return {history, container};
    }

    async createCachedContainers(docker: Dockerode, model: Model) {
        if (!this.service.containerCachingLock.get(model.id)) {
            this.service.containerCachingLock.set(model.id, true);
            const cachedSize = (await this.service.historyController.findAllByImageAndStatus(model.image, HistoryStatus.CACHED)).length;
            const generateSize = model.cacheSize - cachedSize;
            console.log(`[${model.name}] Start creating ${generateSize}/${cachedSize + generateSize} cached containers`);
            const tasks = Array.from({length: model.cacheSize - cachedSize}, () => this.createCachedContainer(docker, model));
            await Promise.all(tasks);
            console.log(`[${model.name}] End creating ${generateSize}/${cachedSize + generateSize} cached containers`);
            this.service.containerCachingLock.set(model.id, false);
        }
    }
}