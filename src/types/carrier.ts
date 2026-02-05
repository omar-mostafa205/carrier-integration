import { RateRequest, RateResponse } from './domain';
export interface ICarrierAdapter {
getRates(request : RateRequest) : Promise<RateResponse>
}
export interface IAuthProvider {
    getToken () : Promise<string>,
    refreshToken () : Promise<string>
}
export interface TokenCache {
    get(key: string): Promise<CachedToken | null>;
    set(key: string, token: CachedToken): Promise<void>;
    clear(): void;
    size(): number;
}
export interface CachedToken {
    accessToken: string | PromiseLike<string>;
    expiresAt : Date
}