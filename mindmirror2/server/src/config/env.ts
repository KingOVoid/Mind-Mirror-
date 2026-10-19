import dotenv from 'dotenv';
import path from 'path';

// Load environment configurations with local override precedence
const serverDir = path.join(__dirname, '..', '..');
const projectDir = path.join(serverDir, '..');

// Base .env files
dotenv.config({ path: path.join(projectDir, '.env') });
dotenv.config({ path: path.join(serverDir, '.env') });

// Local override files (.env.local, env.local)
dotenv.config({ path: path.join(projectDir, '.env.local'), override: true });
dotenv.config({ path: path.join(projectDir, 'env.local'), override: true });
dotenv.config({ path: path.join(serverDir, '.env.local'), override: true });
dotenv.config({ path: path.join(serverDir, 'env.local'), override: true });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  PORT: parseInt(process.env.PORT ?? '4000', 10),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  AI_API_KEY: process.env.AI_API_KEY ?? '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? process.env.AI_API_KEY ?? '',
  GEMINI_MODEL: process.env.GEMINI_MODEL ?? 'gemini-3.8-flash',
  AI_PROVIDER: process.env.AI_PROVIDER ?? 'gemini',
  IS_PROD: (process.env.NODE_ENV ?? 'development') === 'production',
};
