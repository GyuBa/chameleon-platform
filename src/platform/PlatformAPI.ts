import axios, {AxiosInstance} from 'axios';
import {
    HistoryEntityData,
    ModelEntityData, ModelExecuteData,
    ModelsRequestOptions,
    ModelUploadData,
    RegionEntityData,
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
        Object.entries(data).forEach(([name, value]: [string, any]) => formData.append(name, value));
        return formData;
    }

    public static async uploadModel(uploadData: ModelUploadData): Promise<any> {
        const response = await this.instance.post('/models/upload', this.toFormData(uploadData), this.uploadConfig);
        return response?.data;
    }

    public static async executeModel(executeData: ModelExecuteData): Promise<any> {
        const response = await this.instance.post('/models/execute', this.toFormData(executeData), this.uploadConfig);
        return response?.data;
    }

    public static async getModels(options?: ModelsRequestOptions): Promise<ModelEntityData[]> {
        const response = await this.instance.get('/models', {...this.defaultConfig, params: options});
        response?.data.forEach((m: ModelEntityData) => this.restoreTimeProperty(m));
        return response?.data as ModelEntityData[];
    }

    public static async getMyModels(): Promise<ModelEntityData[]> {
        return await this.getModels({ownOnly: true});
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

    public static async getHistories(options?: ModelsRequestOptions): Promise<HistoryEntityData[]> {
        const response = await this.instance.get('/histories', {...this.defaultConfig, params: options});
        this.restoreTimeProperty(response?.data);
        return response?.data as HistoryEntityData[];
    }

    public static async getMyHistories(options?: ModelsRequestOptions): Promise<HistoryEntityData[]> {
        return await this.getHistories({ownOnly: true});
    }

    // TODO: 작업 중
    public static async modifyPassword(uniqueName: string): Promise<UserEntityData> {
        return {} as UserEntityData;
    }

    // TODO: 반환 형 타입 지정
    public static async signIn(email: string, password: string): Promise<any> {
        const response = await this.instance.post('/auths/sign-in', {email, password}, this.defaultConfig);
        return response?.data;
    }

    // TODO: 반환 형 타입 지정
    public static async signUp(email: string, password: string, username: string): Promise<any> {
        const response = await this.instance.post('/auths/sign-up', {email, password, username}, this.defaultConfig);
        return response?.data;
    }

    // TODO: 반환 형 명시, 함수명과 API도 동사 형태로 수정 필요
    public static async updatePoint(amount: number) {
        const response = await this.instance.post('/points/update', {amount}, this.defaultConfig);
        return response?.data;
    }
}
