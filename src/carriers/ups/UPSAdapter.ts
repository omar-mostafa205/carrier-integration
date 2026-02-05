import { ICarrierAdapter } from '../../types/carrier';
import { RateRequest, RateResponse } from '../../types/domain';
import { UPSClient } from './client';
import { UPSMappers } from './mappers';
import { UPSRateResponse, UPSErrorResponse } from '../../types/ups-api';
import { validateRateRequest } from '../../schemas';
import { ValidationError, UPSAPIError, RateLimitError, AuthenticationError } from '../../errors';
import axios from 'axios';

export class UPSAdapter implements ICarrierAdapter {
  constructor(private client: UPSClient) {}

  async getRates(request: RateRequest): Promise<RateResponse> {
    try {
      validateRateRequest(request);
    } catch (error) {
      throw new ValidationError('Invalid rate request', { error });
    }

    const upsRequest = UPSMappers.toUPSRateRequest(request);

    try {
      const upsResponse = await this.client.postWithAuth<UPSRateResponse>(
        '/rating/v1/Rate',
        upsRequest
      );

      return UPSMappers.toRateResponse(upsResponse);
    } catch (error) {
      throw this.handleUPSError(error);
    }
  }

  private handleUPSError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data as UPSErrorResponse | undefined;

      if (status === 401 || status === 403) {
        throw new AuthenticationError('UPS authentication failed', {
          status,
          errors: data?.response?.errors,
        });
      }

      if (status === 429) {
        throw new RateLimitError('UPS rate limit exceeded', {
          retryAfter: error.response?.headers['retry-after'],
        });
      }

      if (status && status >= 400 && status < 500) {
        throw new ValidationError('Invalid request to UPS API', {
          status,
          errors: data?.response?.errors,
        });
      }

      if (status && status >= 500) {
        throw new UPSAPIError('UPS API server error', status, {
          errors: data?.response?.errors,
        });
      }
    }

    throw new UPSAPIError('Unknown UPS API error', undefined, { error });
  }
}