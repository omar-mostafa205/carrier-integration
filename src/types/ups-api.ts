export interface UPSAuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
  }
  
  
  export interface UPSRateRequest {
    RateRequest: {
      Request: {
        TransactionReference: {
          CustomerContext: string;
        };
      };
      Shipment: {
        Shipper: UPSAddress;
        ShipTo: UPSAddress;
        ShipFrom?: UPSAddress;
        Package: UPSPackage | UPSPackage[];
        Service?: {
          Code: string;
          Description?: string;
        };
      };
    };
  }
  
  export interface UPSAddress {
    Name?: string;
    AttentionName?: string;
    Address: {
      AddressLine?: string[];
      City: string;
      StateProvinceCode: string;
      PostalCode: string;
      CountryCode: string;
    };
  }
  
  export interface UPSPackage {
    PackagingType: {
      Code: string;
      Description?: string;
    };
    Dimensions: {
      UnitOfMeasurement: {
        Code: string; 
        Description?: string;
      };
      Length: string;
      Width: string;
      Height: string;
    };
    PackageWeight: {
      UnitOfMeasurement: {
        Code: string;
        Description?: string;
      };
      Weight: string;
    };
  }
  
  
  export interface UPSRateResponse {
    RateResponse: {
      Response: {
        ResponseStatus: {
          Code: string;
          Description: string;
        };
        TransactionReference?: {
          CustomerContext: string;
        };
      };
      RatedShipment: Array<{
        Service: {
          Code: string;
          Description?: string;
        };
        RatedShipmentAlert?: Array<{
          Code: string;
          Description: string;
        }>;
        TotalCharges: {
          CurrencyCode: string;
          MonetaryValue: string;
        };
        TimeInTransit?: {
          ServiceSummary: {
            EstimatedArrival: {
              BusinessDaysInTransit: string;
              Date?: string;
            };
          };
        };
      }>;
    };
  }
  
  
  export interface UPSErrorResponse {
    response: {
      errors: Array<{
        code: string;
        message: string;
      }>;
    };
  }