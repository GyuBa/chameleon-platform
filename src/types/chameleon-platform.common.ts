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
    model: ModelEntityData;
    startedTime: Date;
    endedTime: Date;
    parameters: any;
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
}

export const User: Array<keyof UserEntityData> = [
    'id',
    'email',
    'username',
];

export interface WalletEntityData {
    id: number;
    point: number;
    user: UserEntityData;
}

export const Wallet: Array<keyof WalletEntityData> = ['id', 'point', 'user'];

export const ENTITY_DATA_KEYS = {
    History,
    Image,
    Model,
    Region,
    User,
    Wallet
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
    NONE = 'none',
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
    TEXT = 'text'
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

export enum SocketMessageType {
    HELLO = 'Hello',
    LAUNCH = 'Launch',
    FILE_WAIT = 'FileWait',
    FILE_RECEIVE_END = 'FileReceiveEnd',
    TERMINAL = 'Terminal',
    TERMINAL_RESIZE = 'TerminalResize',
    PROCESS_END = 'ProcessEnd',
    FILE = 'File',
    REQUEST_FILE = 'RequestFile',
    WAIT_RECEIVE = 'WaitReceive',
    LAUNCH_MODEL = 'LaunchModel'
}

export enum SocketReceiveMode {
    JSON,
    FILE
}

/* Upload Parameters */
export type ModelCommonUploadData = {
    modelName: string;
    inputType: string;
    outputType: string;
    regionName: string;
    parameters: string;
    description: string
}
export type ModelImageUploadData = ModelCommonUploadData & { file: File }

export type ModelDockerfileUploadData = ModelCommonUploadData & { files: File[] }

export type ModelExecuteData = {
    modelId: number;
    parameters: string;
    input: File;
}

export type ModelsRequestOptions = {
    ownOnly?: boolean
}

export type HistoriesRequestOptions = {
    ownOnly?: boolean
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
    size: number;
    mimeType: string;
    originalName: string;
}

export type ModelOutputInfo = {
    fileName: string;
    fileSize: number;
}

export type ModelParameters = {
    uischema: any;
    schema: any;
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
