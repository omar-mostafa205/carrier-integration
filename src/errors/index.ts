export class CarrierError extends Error {
    constructor(
      message: string,
      public code: string,
      public statusCode?: number,
      public details?: unknown
    ) {
      super(message);
      this.name = 'CarrierError';
      
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  export class AuthenticationError extends CarrierError {
    constructor(message: string, details?: unknown) {
      super(message, 'AUTH_ERROR', 401, details);
      this.name = 'AuthenticationError';
    }
  }
  
  export class ValidationError extends CarrierError {
    constructor(message: string, details?: unknown) {
      super(message, 'VALIDATION_ERROR', 400, details);
      this.name = 'ValidationError';
    }
  }
  
  export class NetworkError extends CarrierError {
    constructor(message: string, details?: unknown) {
      super(message, 'NETWORK_ERROR', 503, details);
      this.name = 'NetworkError';
    }
  }
  
  export class RateLimitError extends CarrierError {
    constructor(message: string, details?: unknown) {
      super(message, 'RATE_LIMIT_ERROR', 429, details);
      this.name = 'RateLimitError';
    }
  }
  
  export class UPSAPIError extends CarrierError {
    constructor(message: string, statusCode?: number, details?: unknown) {
      super(message, 'UPS_API_ERROR', statusCode, details);
      this.name = 'UPSAPIError';
    }
  }