import { z } from 'zod';

export const AddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2).max(2, 'State must be 2 characters (e.g., CA, NY)'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
  country: z.string().length(2, 'Country must be 2-letter ISO code (e.g., US, CA)'),
});

export const PackageSchema = z.object({
  weight: z.number().positive('Weight must be positive'),
  weightUnit: z.enum(['LBS', 'KG'], {
    error: 'Weight unit must be LBS or KG',
  }),
  length: z.number().positive('Length must be positive'),
  width: z.number().positive('Width must be positive'),
  height: z.number().positive('Height must be positive'),
  dimensionUnit: z.enum(['IN', 'CM']).refine(value => ['IN', 'CM'].includes(value), {
    message: 'Dimension unit must be IN or CM',
  }),
});

export const ServiceLevelSchema = z.enum(['GROUND', 'EXPRESS', '2DAY', 'OVERNIGHT']);

export const RateRequestSchema = z.object({
  origin: AddressSchema,
  destination: AddressSchema,
  package: PackageSchema,
  serviceLevel: ServiceLevelSchema.optional(),
});

export function validateRateRequest(data: unknown) {
  return RateRequestSchema.parse(data);
}