import { RateRequest, RateResponse, Rate, ServiceLevel } from '../../types/domain';
import { UPSRateRequest, UPSRateResponse, UPSAddress, UPSPackage } from '../../types/ups-api';


export class UPSMappers {
  static toUPSRateRequest(request: RateRequest): UPSRateRequest {
    return {
      RateRequest: {
        Request: {
          TransactionReference: {
            CustomerContext: 'Rating Request',
          },
        },
        Shipment: {
          Shipper: this.mapAddressToUPS(request.origin),
          ShipTo: this.mapAddressToUPS(request.destination),
          Package: this.mapPackageToUPS(request.package),
          ...(request.serviceLevel && {
            Service: {
              Code: this.mapServiceLevelToUPS(request.serviceLevel),
            },
          }),
        },
      },
    };
  }

  private static mapAddressToUPS(address: RateRequest['origin']): UPSAddress {
    return {
      Address: {
        AddressLine: [address.street],
        City: address.city,
        StateProvinceCode: address.state,
        PostalCode: address.zipCode,
        CountryCode: address.country,
      },
    };
  }

  private static mapPackageToUPS(pkg: RateRequest['package']): UPSPackage {
    return {
      PackagingType: {
        Code: '02', 
      },
      Dimensions: {
        UnitOfMeasurement: {
          Code: pkg.dimensionUnit === 'IN' ? 'IN' : 'CM',
        },
        Length: pkg.length.toString(),
        Width: pkg.width.toString(),
        Height: pkg.height.toString(),
      },
      PackageWeight: {
        UnitOfMeasurement: {
          Code: pkg.weightUnit === 'LBS' ? 'LBS' : 'KGS',
        },
        Weight: pkg.weight.toString(),
      },
    };
  }

  private static mapServiceLevelToUPS(serviceLevel: ServiceLevel): string {
    const serviceCodes: Record<ServiceLevel, string> = {
      GROUND: '03',      
      EXPRESS: '02',     
      '2DAY': '02',      
      OVERNIGHT: '01',   
    };
    return serviceCodes[serviceLevel];
  }

  static toRateResponse(upsResponse: UPSRateResponse): RateResponse {
    return {
      carrier: 'UPS',
      rates: upsResponse.RateResponse.RatedShipment.map(this.mapRateToDomain),
      requestId: upsResponse.RateResponse.Response.TransactionReference?.CustomerContext,
    };
  }

  private static mapRateToDomain(
    ratedShipment: UPSRateResponse['RateResponse']['RatedShipment'][0]
  ): Rate {
    return {
      serviceLevel: this.mapUPSServiceToLevel(ratedShipment.Service.Code),
      serviceName: this.getServiceName(ratedShipment.Service.Code),
      totalCost: parseFloat(ratedShipment.TotalCharges.MonetaryValue),
      currency: ratedShipment.TotalCharges.CurrencyCode,
      deliveryDays: ratedShipment.TimeInTransit?.ServiceSummary.EstimatedArrival.BusinessDaysInTransit
        ? parseInt(ratedShipment.TimeInTransit.ServiceSummary.EstimatedArrival.BusinessDaysInTransit)
        : undefined,
    };
  }

  private static mapUPSServiceToLevel(code: string): ServiceLevel {
    const levelMap: Record<string, ServiceLevel> = {
      '01': 'OVERNIGHT',
      '02': 'EXPRESS',
      '03': 'GROUND',
      '12': '2DAY',
    };
    return levelMap[code] || 'GROUND';
  }

  private static getServiceName(code: string): string {
    const nameMap: Record<string, string> = {
      '01': 'UPS Next Day Air',
      '02': 'UPS 2nd Day Air',
      '03': 'UPS Ground',
      '12': 'UPS 3 Day Select',
    };
    return nameMap[code] || 'UPS Standard';
  }
}