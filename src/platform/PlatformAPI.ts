import axios, {AxiosInstance} from 'axios';
import {
    HistoriesRequestOptions,
    HistoryEntityData,
    ModelDockerfileUploadData,
    ModelEntityData,
    ModelExecuteData,
    ModelImageUploadData,
    ModelsRequestOptions, PointHistoryEntityData,
    RegionEntityData,
    ResponseData,
    UserEntityData
} from '../types/chameleon-platform.common';

export class PlatformAPI {
    static instance: AxiosInstance = axios.create({
        baseURL: '/api/',
        timeout: 3000,
        withCredentials: true
    });
    private static readonly defaultConfig = {headers: {'Content-Type': 'application/json'}};
    private static readonly uploadConfig = {
        ...this.defaultConfig, timeout: 0, headers: {
            'Content-Type': 'multipart/form-data',
        }
    };

    private static restoreTimeProperty(object: any) {
        for (const key in object) {
            if (object[key] && typeof object[key] === 'object') {
                this.restoreTimeProperty(object[key]);
            } else if (typeof object[key] === 'string' && (key.toLowerCase().endsWith('date') || key.toLowerCase().endsWith('time'))) {
                object[key] = new Date(object[key]);
            }
        }
    }

    public static toFormData(data: any): FormData {
        const formData = new FormData();
        Object.entries(data).forEach(([name, value]: [string, any]) => {
            if (Array.isArray(value)) {
                value.forEach(v => formData.append(name, v));
            } else {
                if (typeof value !== 'string' && !(value instanceof Blob)) {
                    formData.append(name, JSON.stringify(value));
                } else {
                    formData.append(name, value);
                }
            }
        });
        return formData;
    }


    public static async uploadModelWithImage(uploadData: ModelImageUploadData): Promise<ResponseData> {
        const response = await this.instance.post('/models/upload-image', this.toFormData(uploadData), this.uploadConfig);
        return response?.data;
    }

    public static async uploadModelWithDockerfile(uploadData: ModelDockerfileUploadData): Promise<ResponseData> {
        const response = await this.instance.post('/models/upload-dockerfile', this.toFormData(uploadData), this.uploadConfig);
        return response?.data;
    }

    public static async executeModel(executeData: ModelExecuteData): Promise<ResponseData> {
        const response = await this.instance.post('/models/execute', this.toFormData(executeData), this.uploadConfig);
        return response?.data;
    }

    public static async getModels(options?: ModelsRequestOptions): Promise<ModelEntityData[]> {
        const response = await this.instance.get('/models', {...this.defaultConfig, params: options});
        response?.data.forEach((m: ModelEntityData) => this.restoreTimeProperty(m));
        return response?.data as ModelEntityData[];
    }

    public static async getMyModels(options?: ModelsRequestOptions): Promise<ModelEntityData[]> {
        return await this.getModels({...options, ownOnly: true});
    }

    public static async getLoginUser(): Promise<UserEntityData> {
        const response = await this.instance.get('/users/my', this.defaultConfig);
        return response?.data as UserEntityData;
    }

    public static async getRegions(): Promise<RegionEntityData[]> {
        const response = await this.instance.get('/regions', this.defaultConfig);
        return response?.data as RegionEntityData[];
    }

    public static async getModelByUsernameAndUniqueName(username: string, uniqueName: string): Promise<ModelEntityData> {
        return this.getModelByNameId(username + ':' + uniqueName);
    }

    public static async getModelByNameId(nameId: string) {
        const response = await this.instance.get(`/models/name/${nameId}`, this.defaultConfig);
        this.restoreTimeProperty(response?.data);
        return response?.data as ModelEntityData;
    }

    public static async getModelById(modelId: number): Promise<ModelEntityData> {
        const response = await this.instance.get(`/models/${modelId}`, this.defaultConfig);
        this.restoreTimeProperty(response?.data);
        return response?.data as ModelEntityData;
    }

    public static async deleteModelById(modelId: number): Promise<ResponseData> {
        const response = await this.instance.delete(`/models/delete/${modelId}`, this.defaultConfig);
        return response?.data;
    }

    public static async getHistory(historyId: number): Promise<HistoryEntityData> {
        const response = await this.instance.get(`/histories/${historyId}`, {...this.defaultConfig});
        this.restoreTimeProperty(response?.data);
        return response?.data as HistoryEntityData;
    }

    public static async getHistories(options?: HistoriesRequestOptions): Promise<HistoryEntityData[]> {
        const response = await this.instance.get('/histories', {...this.defaultConfig, params: options});
        this.restoreTimeProperty(response?.data);
        return response?.data as HistoryEntityData[];
    }

    public static async getPointsHistories(): Promise<PointHistoryEntityData[]> {
        const response = await this.instance.post('/points', this.defaultConfig);
        return response?.data;
    }

    public static async modifyPassword(newPassword: string): Promise<ResponseData> {
        const response = await this.instance.post('/auths/modify-password', {password: newPassword}, this.defaultConfig);
        return response?.data;
    }

    public static async signIn(email: string, password: string): Promise<ResponseData> {
        const response = await this.instance.post('/auths/sign-in', {email, password}, this.defaultConfig);
        return response?.data;
    }

    public static async signOut(): Promise<ResponseData> {
        const response = await this.instance.delete('/auths/sign-out', this.defaultConfig);
        return response?.data;
    }

    public static async signUp(email: string, password: string, username: string): Promise<ResponseData> {
        const response = await this.instance.post('/auths/sign-up', {email, password, username}, this.defaultConfig);
        return response?.data;
    }

    public static async updatePoint(amount: number): Promise<ResponseData> {
        const response = await this.instance.post('/points/update', {amount}, this.defaultConfig);
        return response?.data;
    }
}
