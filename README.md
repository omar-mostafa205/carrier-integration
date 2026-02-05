# Carrier Integration Service

A TypeScript service that wraps the UPS Rating API to fetch shipping rates. Built to easily add more carriers like FedEx, USPS, and DHL.

## Setup
```bash
npm install
cp .env.example .env
npm test
npm run build
```

Add your UPS credentials to `.env`:
```
UPS_CLIENT_ID=your_client_id
UPS_CLIENT_SECRET=your_secret
UPS_ACCOUNT_NUMBER=your_account
```

## How to Use
```typescript
import { createCarrierService } from './src';

const service = createCarrierService();

const rates = await service.getRates('UPS', {
  origin: {
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'US',
  },
  destination: {
    street: '456 Oak Ave',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'US',
  },
  package: {
    weight: 10,
    weightUnit: 'LBS',
    length: 12,
    width: 8,
    height: 6,
    dimensionUnit: 'IN',
  },
});
```

## How It Works

The service has three layers:

1. **Domain Layer** - Business concepts (Address, Package, Rate)
2. **Carrier Layer** - UPS implementation (can add FedEx, USPS later)
3. **Infrastructure** - HTTP calls, OAuth, caching

When you request rates:
1. Input gets validated
2. Request transforms to UPS format
3. OAuth token fetched (or reused from cache)
4. API call made to UPS
5. Response transforms back to our format
6. Normalized rates returned

## Project Structure
```
src/
  types/
    domain.ts          - Address, Package, Rate (our format)
    carrier.ts         - Interface all carriers must follow
    ups-api.ts         - UPS API types (their format)
  
  carriers/ups/
    UPSAdapter.ts      - Coordinates the workflow
    UPSAuthProvider.ts - Handles OAuth tokens
    mappers.ts         - Converts our format to/from UPS format
    client.ts          - Makes HTTP calls with auth
  
  utils/
    http-client.ts     - Wraps axios with error handling
    token-cache.ts     - Stores tokens in memory
  
  errors/index.ts      - Error types (AuthenticationError, etc)
  schemas/index.ts     - Validation rules using Zod
  config.ts            - Reads environment variables
  index.ts             - Main service entry point

tests/
  fixtures/            - Sample UPS API responses
  integration/         - Tests using mocked HTTP
```

## Design Decisions

**Why separate domain types from UPS types?**
UPS uses field names like "StateProvinceCode". FedEx will use different names. Our domain uses simple "state" everywhere. Mappers handle the translation.

**Why HttpClient wrapper?**
Every carrier needs timeouts and error handling. Write it once, use it everywhere.

**Why ICarrierAdapter interface?**
So we can add FedEx without changing any UPS code. Each carrier implements the same interface.

**Why separate mappers file?**
UPSAdapter handles workflow (validate, call API, handle errors). Mappers just transform data. Easier to test separately.

**Why token cache?**
OAuth tokens last 1 hour. Fetching a new one every request wastes time and hits rate limits.

**Why Zod for validation?**
TypeScript types disappear at runtime. Zod validates actual data and gives clear error messages.

## Adding Another Carrier

Example for FedEx:

1. Create `src/carriers/fedex/FedExAdapter.ts`
2. Implement the `ICarrierAdapter` interface
3. Add FedEx API types to `src/types/fedex-api.ts`
4. Write mappers for FedEx format
5. Register in `src/index.ts`:
```typescript
const fedexAdapter = new FedExAdapter(/* setup */);
return new CarrierService([
  { name: 'UPS', adapter: upsAdapter },
  { name: 'FEDEX', adapter: fedexAdapter },
]);
```

No changes needed to existing UPS code.

## Testing

All tests use stubbed HTTP responses. No real API calls.
```bash
npm test                # Run once
npm run test:watch      # Run on file changes
npm run test:coverage   # See coverage report
```

Tests verify:
- Request payloads match UPS format
- Responses parse correctly
- OAuth tokens cache and refresh
- Errors handled properly

## Error Types

- `ValidationError` - Bad input (missing zipCode, negative weight)
- `AuthenticationError` - OAuth failed
- `NetworkError` - Connection timeout
- `RateLimitError` - Too many requests
- `UPSAPIError` - UPS returned an error

All errors include details for debugging.

## What I Would Add Next

**Short term:**
- Add FedEx support
- Cache rate responses for 5 minutes
- Add request logging

**Long term:**
- Label purchase endpoint
- Shipment tracking
- Address validation
- Retry logic with backoff
- Support multiple packages per shipment

## Files Explained

**src/types/domain.ts**
Business models. Same across all carriers.

**src/types/carrier.ts**
Interface that UPS, FedEx, etc must implement.

**src/types/ups-api.ts**
Exact UPS API structure from their docs.

**src/carriers/ups/UPSAdapter.ts**
Main workflow: validate input, map to UPS, call API, map response, handle errors.

**src/carriers/ups/UPSAuthProvider.ts**
Gets OAuth tokens. Caches them. Refreshes when expired.

**src/carriers/ups/mappers.ts**
Converts between our Address/Package format and UPS's format.

**src/carriers/ups/client.ts**
HTTP client that automatically adds auth headers.

**src/utils/http-client.ts**
Wraps axios. Handles timeouts and network errors.

**src/utils/token-cache.ts**
Stores tokens in memory with expiration.

**src/errors/index.ts**
Custom error classes with status codes and details.

**src/schemas/index.ts**
Zod schemas that validate input data.

**src/config.ts**
Loads and validates environment variables.

**src/index.ts**
CarrierService class and factory function.

## Running Commands
```bash
npm run dev          # Run with tsx
npm run build        # Compile TypeScript
npm test             # Run tests
npm run type-check   # Check types without building
```
