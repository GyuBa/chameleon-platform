import axios, {AxiosInstance} from 'axios';

export class PaymentAPI {
    static instance: AxiosInstance = axios.create({
        timeout: 3000,
        withCredentials: true
    });
    private static readonly defaultConfig = {headers: {'Content-Type': 'application/json'}};

    public static async getToken(imp_key: string, imp_secret: string): Promise<string> {
        const response = await this.instance.post('https://api.iamport.kr/users/getToken', {
            imp_key,
            imp_secret
        }, this.defaultConfig);
        return response?.data?.response?.access_token;
    }

    public static async getPaymentData(token: string, imp_uid: string): Promise<any> {
        const response = await this.instance.get(`https://api.iamport.kr/payments/${imp_uid}`, {
            headers: {'Authorization': token}
        });
        return response?.data?.response;
    }
}
