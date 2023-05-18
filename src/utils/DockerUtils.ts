import * as Dockerode from 'dockerode';
import {Container} from 'dockerode';

export class DockerUtils {

    static exec(container: Container, command: string, keepOutput?: boolean) {
        return new Promise<string>((resolve, reject) => {
            container.exec({
                Cmd: ['/bin/sh', '-c', command],
                AttachStdin: true,
                AttachStdout: true,
            }, async (err, exec) => {
                if (err || !exec) {
                    reject(err);
                    return;
                }
                let output = '';
                const stream = await exec.start({hijack: true, stdin: true});
                if (keepOutput) {
                    stream?.on('data', (chunk: Buffer) => {
                        output += chunk.toString();
                    });
                }
                stream?.on('end', () => {
                    resolve(output);
                });
            });
        });
    }

    static async loadImage(docker: Dockerode, path: string, tagOptions) {
        await new Promise((resolve, reject) => {
            let importedIdentifier;
            let buffer = '';
            let loadEvent;
            const handleEvent = async () => {
                const image = await docker.getImage(loadEvent.id);
                await image.tag(tagOptions);
                const originalTagImage = await docker.getImage(importedIdentifier);
                try {
                    await originalTagImage.remove();
                } catch (e) {
                    /* Empty */
                }
                resolve(image);
            };

            docker.getEvents(function (error, eventStream) {
                eventStream.on('data', async (data) => {
                    let event;
                    try {
                        event = JSON.parse(buffer + data.toString());
                        buffer = '';
                    } catch (e) {
                        buffer += data.toString();
                    }
                    if (!loadEvent && event && event.Type === 'image' && event.Action === 'load') {
                        loadEvent = event;
                        eventStream.removeAllListeners();
                        eventStream.unpipe();
                        if (importedIdentifier) {
                            await handleEvent();
                        }
                    }
                });
            });

            docker.loadImage(path, {}, (error, stream) => {
                if (error) {
                    return reject(error);
                }
                docker.modem.followProgress(stream, async (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    importedIdentifier = res[0].stream.split(':').slice(1).join(':').trim();
                    if (loadEvent) {
                        await handleEvent();
                    }
                });
            });
        });
    }
}