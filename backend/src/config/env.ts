import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.string().default('7d'),
    PORT: z.string().default('8080'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    FRONTEND_URL: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_CALLBACK_URL: z.string(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GITHUB_CALLBACK_URL: z.string().optional(),
    GITHUB_APP_ID: z.string().optional(),
    GITHUB_APP_PRIVATE_KEY: z.string().optional(),
    GITHUB_WEBHOOK_SECRET: z.string().optional(),
    SESSION_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
