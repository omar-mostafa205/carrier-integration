import { TokenCache, CachedToken } from '../types/carrier';

export class InMemoryTokenCache implements TokenCache {
  private cache = new Map<string, CachedToken>();

  async get(key: string): Promise<CachedToken | null> {
    const token = this.cache.get(key);
    
    if (!token) {
      return null;
    }
    if (Date.now() >= token.expiresAt.getTime()) {
      this.cache.delete(key);
      return null;
    }

    return token;
  }

  async set(key: string, token: CachedToken): Promise<void> {
    this.cache.set(key, token);
  }

  clear(): void {
    this.cache.clear();
  }
  size(): number {
    return this.cache.size;
  }
}