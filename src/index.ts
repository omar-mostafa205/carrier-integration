import { ICarrierAdapter } from './types/carrier';
import { RateRequest, RateResponse } from './types/domain';
import { UPSAdapter } from './carriers/ups/UPSAdapter';
import { UPSAuthProvider } from './carriers/ups/UPSAuthProvider';
import { UPSClient } from './carriers/ups/client';
import { HttpClient } from './utils/http-client';
import { InMemoryTokenCache } from './utils/token-cache';
import { config } from './config';

export class CarrierService {
  private adapters: Map<string, ICarrierAdapter> = new Map();

  constructor(adapters: Array<{ name: string; adapter: ICarrierAdapter }>) {
    adapters.forEach(({ name, adapter }) => {
      this.adapters.set(name.toUpperCase(), adapter);
    });
  }

  async getRates(carrier: string, request: RateRequest): Promise<RateResponse> {
    const adapter = this.adapters.get(carrier.toUpperCase());
    if (!adapter) {
      throw new Error(
        `Carrier ${carrier} not supported. Available carriers: ${Array.from(
          this.adapters.keys()
        ).join(', ')}`
      );
    }
    return adapter.getRates(request);
  }

  async compareRates(request: RateRequest): Promise<RateResponse[]> {
    const results = await Promise.allSettled(
      Array.from(this.adapters.entries()).map(([name, adapter]) =>
        adapter.getRates(request).catch((error) => {
          console.error(`Failed to get rates from ${name}:`, error.message);
          throw error;
        })
      )
    );

    return results
      .filter((result): result is PromiseFulfilledResult<RateResponse> => result.status === 'fulfilled')
      .map((result) => result.value);
  }

  getSupportedCarriers(): string[] {
    return Array.from(this.adapters.keys());
  }
}

export function createCarrierService(): CarrierService {
  const tokenCache = new InMemoryTokenCache();
  const httpClient = new HttpClient(config.UPS_BASE_URL);
  
  const authProvider = new UPSAuthProvider(httpClient, tokenCache);
  const upsClient = new UPSClient(authProvider);
  const upsAdapter = new UPSAdapter(upsClient);

  return new CarrierService([
    { name: 'UPS', adapter: upsAdapter },
  ]);
}

export * from './types/domain';
export * from './types/carrier';
export * from './errors';
export { UPSAdapter } from './carriers/ups/UPSAdapter';