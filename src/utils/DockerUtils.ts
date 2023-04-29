import * as Dockerode from 'dockerode';
import {Container} from "dockerode";

export class DockerUtils {

    static exec(container: Container, command: string) {
        return new Promise(resolve => {
            container.exec({
                Cmd: ['/bin/bash', '-c', command],
                AttachStdin: true,
                AttachStdout: true
            }, async (err, exec) => {
                const stream = await exec?.start({hijack: true, stdin: true});
                stream?.on('finish', resolve);
            });
        });
    }

    static async loadImage(docker: Dockerode, path: string, tagOptions) {
        await new Promise((resolve, reject) => {
            let importedIdentifier;
            docker.getEvents(function (error, eventStream) {
                eventStream.on('data', async (data) => {
                    const event = JSON.parse(data.toString());
                    if (event.Type === 'image' && event.Action === 'load') {
                        const image = await docker.getImage(event.id);
                        await image.tag(tagOptions);
                        const originalTagImage = await docker.getImage(importedIdentifier);
                        await originalTagImage.remove();

                        eventStream.removeAllListeners();
                        eventStream.unpipe();

                        resolve(image);
                    }
                });
            });

            docker.loadImage(path, {}, (error, stream) => {
                if (error) {
                    return reject(error);
                }
                docker.modem.followProgress(stream, (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    importedIdentifier = res[0].stream.split(':').slice(1).join(':').trim();
                });
            });
        });
    }
}