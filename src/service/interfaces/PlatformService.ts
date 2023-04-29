import {ImageController} from '../../controller/ImageController';
import {ModelController} from '../../controller/ModelController';
import {WalletController} from '../../controller/WalletController';
import {UserController} from '../../controller/UserController';
import {RegionController} from '../../controller/RegionController';
import {DataSource} from 'typeorm';
import {SessionController} from '../../controller/SessionController';
import {HistoryController} from '../../controller/HistoryController';
import {BaseController} from '../../controller/interfaces/BaseController';

export abstract class PlatformService {
    private static controllers: Map<Function, BaseController<any>>;

    protected get imageController(): ImageController {
        return PlatformService.getController(ImageController);
    }

    protected get modelController(): ModelController {
        return PlatformService.getController(ModelController);
    }

    protected get regionController(): RegionController {
        return PlatformService.getController(RegionController);
    }

    protected get sessionController(): SessionController {
        return PlatformService.getController(SessionController);
    }

    protected get userController(): UserController {
        return PlatformService.getController(UserController);
    }

    protected get walletController(): WalletController {
        return PlatformService.getController(WalletController);
    }

    protected get historyController(): HistoryController {
        return PlatformService.getController(HistoryController);
    }

    public static init(source: DataSource): void {
        this.controllers = new Map();
        this.controllers.set(ImageController, new ImageController(source));
        this.controllers.set(ModelController, new ModelController(source));
        this.controllers.set(RegionController, new RegionController(source));
        this.controllers.set(SessionController, new SessionController(source));
        this.controllers.set(UserController, new UserController(source));
        this.controllers.set(WalletController, new WalletController(source));
        this.controllers.set(HistoryController, new HistoryController(source));
    }

    private static getController<T extends BaseController<any>>(controllerClass: { new(...args: any[]): T }): T {
        return this.controllers.get(controllerClass) as T;
    }
}