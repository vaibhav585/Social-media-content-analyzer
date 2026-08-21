// =============================================================================
// Environment Configuration
// Validates all required env vars at startup — fails fast with clear messages.
// =============================================================================

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  // Server
  port: number;
  nodeEnv: string;

  // Supabase
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  supabaseAnonKey: string;

  // AI Providers
  geminiApiKey: string;
  groqApiKey: string;

  // Rate Limits
  geminiRpmLimit: number;
  geminiRpdLimit: number;
  groqRpmLimit: number;
  groqRpdLimit: number;

  // CORS
  clientUrl: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

function parseIntEnv(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`❌ Invalid integer for env var ${name}: "${value}"`);
  }
  return parsed;
}

export const env: EnvConfig = {
  port: parseIntEnv('PORT', 3001),
  nodeEnv: optionalEnv('NODE_ENV', 'development'),

  supabaseUrl: requireEnv('SUPABASE_URL'),
  supabaseServiceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  supabaseAnonKey: requireEnv('SUPABASE_ANON_KEY'),

  geminiApiKey: requireEnv('GEMINI_API_KEY'),
  groqApiKey: requireEnv('GROQ_API_KEY'),

  geminiRpmLimit: parseIntEnv('GEMINI_RPM_LIMIT', 15),
  geminiRpdLimit: parseIntEnv('GEMINI_RPD_LIMIT', 1500),
  groqRpmLimit: parseIntEnv('GROQ_RPM_LIMIT', 30),
  groqRpdLimit: parseIntEnv('GROQ_RPD_LIMIT', 1000),

  clientUrl: optionalEnv('CLIENT_URL', 'http://localhost:5173'),
};

export const isProduction = env.nodeEnv === 'production';
export const isDevelopment = env.nodeEnv === 'development';
