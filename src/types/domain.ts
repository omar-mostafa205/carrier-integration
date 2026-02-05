
export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }
  
  export interface Package {
    weight: number;
    weightUnit: 'LBS' | 'KG';
    length: number;
    width: number;
    height: number;
    dimensionUnit: 'IN' | 'CM';
  }
  
  export type ServiceLevel = 'GROUND' | 'EXPRESS' | '2DAY' | 'OVERNIGHT';
  
  export interface RateRequest {
    origin: Address;
    destination: Address;
    package: Package;
    serviceLevel?: ServiceLevel;
  }
  
  export interface Rate {
    serviceLevel: ServiceLevel;
    serviceName: string;
    totalCost: number;
    currency: string;
    deliveryDays?: number;
  }
  
  export interface RateResponse {
    carrier: string;
    rates: Rate[];
    requestId?: string;
  }