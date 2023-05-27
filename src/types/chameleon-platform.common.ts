/* EntityData & Keys */
export interface HistoryEntityData {
    id: number;
    createdTime: Date;
    updatedTime: Date;
    status: HistoryStatus;
    inputPath: string;
    inputInfo: ModelInputInfo;
    inputType: ModelInputType;
    outputPath: string;
    outputInfo: ModelOutputInfo;
    outputType: ModelOutputType;
    description: string;
    executor: UserEntityData;
    parent: HistoryEntityData;
    numberOfParents: number;
    modelPrice: number;
    model: ModelEntityData;
    startedTime: Date;
    endedTime: Date;
    parameters: ModelExecutionParameters;
    terminal: string;
}

export const History: Array<keyof HistoryEntityData> = [
    'id',
    'createdTime',
    'updatedTime',
    'status',
    'inputPath',
    'inputInfo',
    'inputType',
    'outputPath',
    'outputInfo',
    'outputType',
    'description',
    'executor',
    'parent',
    'numberOfParents',
    'modelPrice',
    'model',
    'startedTime',
    'endedTime',
    'parameters',
    'terminal',
];

export interface ImageEntityData {
    id: number;
    repository: string;
    tag: string;
    path: string;
    uniqueId: string;
    region: RegionEntityData;
}

export const Image: Array<keyof ImageEntityData> = [
    'id',
    'repository',
    'tag',
    'path',
    'uniqueId',
    'region',
];

export interface ModelEntityData {
    id: number;
    createdTime: Date;
    updatedTime: Date;
    uniqueName: string;
    name: string;
    description: string;
    register: UserEntityData;
    image: ImageEntityData;
    cacheSize: number;
    inputType: ModelInputType;
    outputType: ModelOutputType;
    parameters: ModelParameters;
    config: ModelConfig;
    category: string;
    price: number;
}

export const Model: Array<keyof ModelEntityData> = [
    'id',
    'createdTime',
    'updatedTime',
    'uniqueName',
    'name',
    'description',
    'register',
    'image',
    'cacheSize',
    'inputType',
    'outputType',
    'parameters',
    'config',
    'category',
    'price'
];


export interface RegionEntityData {
    id: number;
    name: string;
    host: string;
    port: number;
    cacheSize: number;
}

export const Region: Array<keyof RegionEntityData> = [
    'id',
    'name',
    'host',
    'port',
    'cacheSize',
];

export interface UserEntityData {
    id: number;
    email: string;
    username: string;
    point: number;
}

export const User: Array<keyof UserEntityData> = [
    'id',
    'email',
    'username',
    'point'
];

export interface PointHistoryEntityData {
    id: number;
    createdTime: Date
    user: UserEntityData;
    modelHistory?: HistoryEntityData;
    type: PointHistoryType;
    delta: number;
    leftPoint: number;
}

export const PointHistory: Array<keyof PointHistoryEntityData> = ['id', 'createdTime', 'user', 'modelHistory', 'type', 'delta', 'leftPoint'];

export const ENTITY_DATA_KEYS = {
    History,
    Image,
    Model,
    Region,
    User,
    PointHistory
};

/* Enums */
export enum HistoryStatus {
    CACHED = 'cached',
    INITIALIZING = 'initializing',
    RUNNING = 'running',
    ERROR = 'error',
    FINISHED = 'finished',
}

export enum ModelInputType {
    EMPTY = 'empty',
    IMAGE = 'image',
    VIDEO = 'video',
    SOUND = 'sound',
    TEXT = 'text',
    ZIP = 'zip',
    BINARY = 'binary'
}

export enum ModelOutputType {
    IMAGE = 'image',
    VIDEO = 'video',
    SOUND = 'sound',
    TEXT = 'text',
    ZIP_GALLERY = 'zip-gallery',
    BINARY = 'binary'
}

export enum ModelSearchOption {
    NAME = 'Name',
    DESCRIPTION = 'Description',
    NAME_AND_DESCRIPTION = 'Name & Description',
    CATEGORY = 'Category',
    INPUT_TYPE = 'Input Type',
    OUTPUT_TYPE = 'Output Type',
    REGISTER = 'Register'
}

export enum WSMessageType {
    READY = 'Ready',
    PATH = 'Path',
    TERMINAL_RESIZE = 'TerminalResize',
    TERMINAL = 'Terminal',
    UPDATE_MODEL = 'UpdateModel',
    UPDATE_MODELS = 'UpdateModels',
    UPDATE_HISTORY = 'UpdateHistory',
    UPDATE_HISTORIES = 'UpdateHistories'
}

export type WSMessage = {
    msg: string;
} & any;

export type WSPathMessage = {
    msg: WSMessageType.PATH;
    path: string;
};

export type WSTerminalResizeMessage = {
    msg: WSMessageType.TERMINAL_RESIZE;
    historyId: number;
    rows: number;
    cols: number;
};

export type WSUpdateHistoryMessage = {
    msg: WSMessageType.UPDATE_HISTORY;
    history: HistoryEntityData
}

export type WSTerminalMessage = {
    msg: WSMessageType.TERMINAL;
    data: string;
}


export enum SocketMessageType {
    LAUNCH = 'Launch',
    FILE_WAIT = 'FileWait',
    FILE_RECEIVE_END = 'FileReceiveEnd',
    TERMINAL = 'Terminal',
    TERMINAL_RESIZE = 'TerminalResize',
    PROCESS_END = 'ProcessEnd',
    FILE = 'File',
    REQUEST_FILE = 'RequestFile',
    WAIT_RECEIVE = 'WaitReceive',
    LAUNCH_MODEL = 'LaunchModel',
    EXIT = 'Exit'
}

export type SocketLaunchMessage = {
    msg: SocketMessageType.LAUNCH;
    isMainConnection: boolean;
    historyId: number;
    executionData?: ExecutionData
};
export type SocketFileWaitMessage = { msg: SocketMessageType.FILE_WAIT; };
export type SocketFileReceiveEndMessage = { msg: SocketMessageType.FILE_RECEIVE_END; };
export type SocketTerminalMessage = {
    msg: SocketMessageType.TERMINAL;
    data: string
};
export type SocketTerminalResizeMessage = {
    msg: SocketMessageType.TERMINAL_RESIZE;
    rows: number;
    cols: number;
};
export type SocketProcessEndMessage = { msg: SocketMessageType.PROCESS_END; };
export type SocketFileMessage = {
    msg: SocketMessageType.FILE;
    fileSize: number;
    filePath?: string;
};

export type SocketRequestFileMessage = {
    msg: SocketMessageType.REQUEST_FILE,
    filePath: string;
};

export type SocketWaitReceiveMessage = { msg: SocketMessageType.WAIT_RECEIVE; };
export type SocketLaunchModelMessage = {
    msg: SocketMessageType.LAUNCH_MODEL,
    scriptPath: string;
    options: LaunchOptions;
};
export type SocketExitMessage = {
    msg: SocketMessageType.EXIT,
    code: number;
    message?: string;
};

export enum SocketReceiveMode {
    JSON,
    FILE
}

export enum PointHistoryType {
    USE_PAID_MODEL = 'UsePaidModel',
    CHARGE = 'Charge'
}

/* Upload Parameters */
export type ModelCommonUploadData = {
    modelName: string;
    inputType: ModelInputType;
    outputType: ModelOutputType;
    regionName: string;
    parameters: ModelParameters;
    description: string
    category?: string;
    price?: number;
}
export type ModelImageUploadData = ModelCommonUploadData & { file: File }

export type ModelDockerfileUploadData = ModelCommonUploadData & { files: File[] }

export type ModelExecutionParameters = any;

export type ModelExecutionData = {
    modelId: number;
    parameters: ModelExecutionParameters;
    input: File;
}

export type ModelsRequestOptions = {
    ownOnly?: boolean;
    searchTerm?: string | ModelInputType | ModelOutputType;
    searchOption?: ModelSearchOption;
}

export type HistoriesRequestOptions = {
    paidOnly?: boolean;
}

/* Etc Types */
export type ResponseData = {
    msg: 'ok' |
        'server_error' |
        'non_field_error' |
        'unable_credential_errors' |
        'duplicated_email_error' |
        'duplicated_name_error' |
        'not_authenticated_error' |
        'not_found_error' |
        'wrong_information_error' |
        'wrong_request_error' |
        'wrong_permission_error' |
        'region_not_found';
    reason?: string;
}

export type ModelInputInfo = {
    mimeType?: string;
    fileSize: number;
    fileName: string;
}

export type ModelOutputInfo = {
    fileName: string;
    fileSize: number;
}

export type ModelParameters = {
    uischema: any;
    schema: any;
    data: any;
}

export type ModelConfig = {
    paths: {
        script: string;
        input: string;
        inputInfo: string;
        parameters: string;
        output: string;
        outputInfo: string;
        outputDescription: string;
        controllerDirectory: string;
        debugLog: string;
    }
}

export type TerminalResizeOption = {
    rows: number;
    cols: number;
}

export type LaunchOptions = {
    rows?: number;
    cols?: number;
}

export type ExecutionData = {
    username: string;
    uniqueName: string;
    inputPath?: string;
    parametersPath?: string;
    outputPath?: string;
}

export const SitePaths = {
    ROOT: '/',
    PAYMENT: '/payment',
    PAYMENT_HISTORIES: '/payment-histories',
    MODEL: (username: string, uniqueName: string) => `/model/${username}/${uniqueName}`,
    MODEL_RAW: '/model',
    MODELS: '/models',
    ALL_MODELS: '/models/all',
    MY_MODELS: '/models/my',
    CREATE_MODEL: '/models/create',
    CREATE_MODEL_INFO: '/models/create/info',
    CREATE_MODEL_DESCRIPTION: '/models/create/description',
    CREATE_MODEL_PARAMETERS: '/models/create/parameters',
    HISTORY: (historyId: number | string) => `/history/${Number.isInteger(historyId) ? (historyId as number + 1) : historyId}`,
    HISTORY_RAW: '/history',
    HISTORIES: '/histories',
    ACCOUNT: '/account',
    SIGN_IN: '/sign-in',
    SIGN_UP: '/sign-up',
    CHANGE_PASSWORD: '/change-password'
};