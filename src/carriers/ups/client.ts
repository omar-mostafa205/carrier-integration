import { HttpClient } from '../../utils/http-client';
import { IAuthProvider } from '../../types/carrier';
import { config } from '../../config';

export class UPSClient extends HttpClient {
  constructor(private authProvider: IAuthProvider) {
    super(config.UPS_BASE_URL);
  }
  async getWithAuth<T>(url: string): Promise<T> {
    const token = await this.authProvider.getToken();
    return this.get<T>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async postWithAuth<T>(url: string, data: unknown): Promise<T> {
    const token = await this.authProvider.getToken();
    return this.post<T>(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}