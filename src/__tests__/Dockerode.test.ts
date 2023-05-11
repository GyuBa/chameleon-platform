import {TestingManager} from './common/TestingManager';
import {LoginUtils} from './common/LoginUtils';
import {RegionController} from '../controller/RegionController';
import PlatformServer from '../server/core/PlatformServer';
import * as Dockerode from 'dockerode';

describe('Dockerode Test', () => {
    beforeAll(async () => {
        await TestingManager.init();
        await LoginUtils.login();
    });

    test('build image test1', async () => {
        const regionController = new RegionController(PlatformServer.source);
        const docker = new Dockerode((await regionController.getAll())[0]);
        const stream = await docker.buildImage('dockerfile.tar', {t:'imagetest1:version1'});
        await new Promise((resolve, reject) => {
            docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
        });
    });
});
