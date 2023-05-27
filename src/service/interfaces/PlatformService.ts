import {ImageController} from '../../controller/ImageController';
import {ModelController} from '../../controller/ModelController';
import {WalletController} from '../../controller/WalletController';
import {UserController} from '../../controller/UserController';
import {RegionController} from '../../controller/RegionController';
import {DataSource} from 'typeorm';
import {SessionController} from '../../controller/SessionController';
import {HistoryController} from '../../controller/HistoryController';
import {ModelExecutionManager} from "../manager/ModelExecutionManager";
import {PointHistoryController} from "../../controller/PointHistoryController";
import {EarnedPointHistory} from "../../entities/EarnedPointHistory";
import {EarnedPointHistoryController} from "../../controller/EarnedPointHistoryController";


export class PlatformService {
    private static thisService = new PlatformService();
    private static staticMap: Map<Function, any>;

    public containerCachingLock = new Map<number, boolean>();

    public get imageController(): ImageController {
        return PlatformService.getController(ImageController);
    }

    public get modelController(): ModelController {
        return PlatformService.getController(ModelController);
    }

    public get regionController(): RegionController {
        return PlatformService.getController(RegionController);
    }

    public get sessionController(): SessionController {
        return PlatformService.getController(SessionController);
    }

    public get userController(): UserController {
        return PlatformService.getController(UserController);
    }

    public get walletController(): WalletController {
        return PlatformService.getController(WalletController);
    }

    public get historyController(): HistoryController {
        return PlatformService.getController(HistoryController);
    }

    public get pointHistoryController(): PointHistoryController {
        return PlatformService.getController(PointHistoryController);
    }

    public get earnedPointHistoryController(): EarnedPointHistoryController {
        return PlatformService.getController(EarnedPointHistoryController);
    }

    public get modelExecutionManager(): ModelExecutionManager {
        return PlatformService.getController(ModelExecutionManager);
    }

    public static init(source: DataSource): void {
        this.staticMap = new Map();
        this.staticMap.set(ImageController, new ImageController(source));
        this.staticMap.set(ModelController, new ModelController(source));
        this.staticMap.set(RegionController, new RegionController(source));
        this.staticMap.set(SessionController, new SessionController(source));
        this.staticMap.set(UserController, new UserController(source));
        this.staticMap.set(WalletController, new WalletController(source));
        this.staticMap.set(HistoryController, new HistoryController(source));
        this.staticMap.set(PointHistoryController, new PointHistoryController(source));
        this.staticMap.set(EarnedPointHistoryController, new EarnedPointHistoryController(source));
        this.staticMap.set(ModelExecutionManager, new ModelExecutionManager(this.thisService));
    }

    private static getController<T>(controllerClass: { new(...args: any[]): T }): T {
        return this.staticMap.get(controllerClass) as T;
    }
}