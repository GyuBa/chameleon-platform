import {UserController} from '../../controller/UserController';
import PlatformServer from '../../server/core/PlatformServer';
import {PlatformAPI} from "../../platform/PlatformAPI";

const testAccount = {
    'email': 'test@test.com',
    'password': 'test',
    'username': 'test'
};

export class LoginUtils {
    static async login() {
        const userController = new UserController(PlatformServer.source);
        const testUser = await userController.findByEmail(testAccount.email);
        if (!testUser) {
            await PlatformAPI.signUp(testAccount.email, testAccount.password, testAccount.username);
        }
        await PlatformAPI.signIn(testAccount.email, testAccount.password);
    }
}