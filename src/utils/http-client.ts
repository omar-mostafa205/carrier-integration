import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { config } from '../config';
import { NetworkError } from '../errors';

export class HttpClient {
    private client: AxiosInstance;
    constructor(baseUrl: string) {
        this.client = axios.create({
            baseURL: baseUrl,
            timeout: config.REQUEST_TIMEOUT_MS,
            headers: {
                'Content-Type': 'application/json',
              },
        })
        this.client.interceptors.response.use(
            (response) => response,
            error => {
                if (error instanceof AxiosError) {
                    if (error.response) {
                        throw new NetworkError(error.response.data.message);
                    } else {
                        throw new NetworkError(error.message);
                    }
                }
            }
        )
    }
    async get<T> (path: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.client.get<T>(path, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    async post<T> (path: string, data: unknown, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.client.post<T>(path, data, config);
            return response.data;
        } catch (error) {
            throw error
        }
    }
}