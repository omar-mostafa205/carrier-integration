import { IAuthProvider, TokenCache, CachedToken } from '../../types/carrier';
import { HttpClient } from '../../utils/http-client';
import { UPSAuthResponse } from '../../types/ups-api';
import { AuthenticationError } from '../../errors';
import { config } from '../../config';

export class UPSAuthProvider implements IAuthProvider {
  private readonly TOKEN_CACHE_KEY = 'ups_token';
  private readonly REFRESH_BUFFER_MS = 5 * 60 * 1000;

  constructor(
    private httpClient: HttpClient,
    private tokenCache: TokenCache
  ) {}

  async getToken(): Promise<string> {
    const cachedToken = await this.tokenCache.get(this.TOKEN_CACHE_KEY);
    
    if (cachedToken && this.isTokenValid(cachedToken)) {
      return cachedToken.accessToken;
    }

    return this.refreshToken();
  }

  async refreshToken(): Promise<string> {
    try {
      const credentials = Buffer.from(
        `${config.UPS_CLIENT_ID}:${config.UPS_CLIENT_SECRET}`
      ).toString('base64');

      const response = await this.httpClient.post<UPSAuthResponse>(
        '/security/v1/oauth/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      const expiresAt = Date.now() + (response.expires_in * 1000) - this.REFRESH_BUFFER_MS;

      const cachedToken: CachedToken = {
          accessToken: response.access_token,
          expiresAt: new Date(expiresAt),
      };

      await this.tokenCache.set(this.TOKEN_CACHE_KEY, cachedToken);

      return response.access_token;
    } catch (error) {
      throw new AuthenticationError('Failed to authenticate with UPS', { error });
    }
  }

  private isTokenValid(token: CachedToken): boolean {
    return Date.now() < token.expiresAt.getTime();
  }
}