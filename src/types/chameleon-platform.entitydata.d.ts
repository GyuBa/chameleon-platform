export interface HistoryEntityData {
    id: number;
    createdTime: Date;
    updatedTime: Date;
    status: string;
    inputPath: string;
    inputInfo: any;
    outputPath: string;
    outputInfo: any;
    description: string;
    executor: UserEntityData;
    model: ModelEntityData;
    startedTime: Date;
    endedTime: Date;
    parameters: any;
    terminal: string;
}

export interface ImageEntityData {
    id: number;
    repository: string;
    tag: string;
    path: string;
    uniqueId: string;
    region: RegionEntityData;
}

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
    inputType: string;
    outputType: string;
    parameters: any;
    config: any;
}

export interface RegionEntityData {
    id: number;
    name: string;
    host: string;
    port: number;
    cacheSize: number;
}

export interface UserEntityData {
    id: number;
    email: string;
    username: string;
}

export interface WalletEntityData {
    id: number;
    point: number;
    user: UserEntityData;
}
