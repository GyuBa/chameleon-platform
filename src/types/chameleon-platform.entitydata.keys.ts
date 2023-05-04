import {
    HistoryEntityData,
    ImageEntityData,
    ModelEntityData,
    RegionEntityData,
    UserEntityData,
    WalletEntityData
} from './chameleon-platform.entitydata';

export const History: Array<keyof HistoryEntityData> = [
    'id',
    'createdTime',
    'updatedTime',
    'status',
    'inputPath',
    'inputInfo',
    'outputPath',
    'outputInfo',
    'description',
    'executor',
    'model',
    'startedTime',
    'endedTime',
    'parameters',
    'terminal',
];

export const Image: Array<keyof ImageEntityData> = [
    'id',
    'repository',
    'tag',
    'path',
    'uniqueId',
    'region',
];

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

export const Region: Array<keyof RegionEntityData> = [
    'id',
    'name',
    'host',
    'port',
    'cacheSize',
];

export const User: Array<keyof UserEntityData> = [
    'id',
    'email',
    'username',
];
export const Wallet: Array<keyof WalletEntityData> = ['id', 'point', 'user'];

export const EntityDataKeys = {
    History,
    Image,
    Model,
    Region,
    User,
    Wallet
};