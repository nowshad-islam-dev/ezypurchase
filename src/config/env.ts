import 'dotenv/config';
import { z } from 'zod';

const envVarsSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']),
  PORT: z
    .string()
    .default('3000')
    .transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string().describe('PostgreSQL DB url'),
  JWT_SECRET: z.string().describe('JWT secret key'),
  JWT_ACCESS_EXPIRATION_MINUTES: z
    .string()
    .default('30')
    .transform((val) => parseInt(val, 10)),
  JWT_REFRESH_EXPIRATION_DAYS: z
    .string()
    .default('30')
    .transform((val) => parseInt(val, 10)),
});

const parseResult = envVarsSchema.safeParse(process.env);

if (!parseResult.success) {
  throw new Error(`Config validation error: ${parseResult.error.message}`);
}

const envVars = parseResult.data;

export const ENV = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  postgres: {
    url: envVars.DATABASE_URL,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
  },
};
