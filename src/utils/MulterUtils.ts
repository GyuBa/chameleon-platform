import * as crypto from 'crypto';
import * as fs from 'fs';

export class MulterUtils {
    static fixNameEncoding(req, file, cb) {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, true);
    }

    static getMulterLikeFilePath(basePath: string) {
        let path;
        for (; ;) {
            path = `${basePath}/${crypto.randomBytes(16).toString('hex')}`;
            if (!fs.existsSync(path)) {
                break;
            }
        }
        return path;
    }
}