import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  UPS_BASE_URL: z.string().url().default('https://wwwcie.ups.com/api'),
  UPS_CLIENT_ID: z.string().min(1, 'UPS_CLIENT_ID is required'),
  UPS_CLIENT_SECRET: z.string().min(1, 'UPS_CLIENT_SECRET is required'),
  UPS_ACCOUNT_NUMBER: z.string().min(1, 'UPS_ACCOUNT_NUMBER is required'),
  REQUEST_TIMEOUT_MS: z.coerce.number().positive().default(10000),
});

export const config = configSchema.parse(process.env);

export type Config = z.infer<typeof configSchema>;