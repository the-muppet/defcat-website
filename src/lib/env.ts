/**
 * Environment Variable Validation
 * Validates required environment variables at build/runtime
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'PATREON_CLIENT_ID',
  'PATREON_CLIENT_SECRET',
  'PATREON_REDIRECT_URI',
] as const;

const optionalEnvVars = [
  'NEXT_PUBLIC_SITE_URL',
  'NODE_ENV',
] as const;

interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validates all required environment variables are present
 * @returns Validation result with missing variables
 */
export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  for (const key of optionalEnvVars) {
    if (!process.env[key]) {
      warnings.push(`Optional environment variable ${key} is not set`);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Validates environment variables and throws error if any are missing
 * Call this in your root layout or middleware
 */
export function requireValidEnv(): void {
  const result = validateEnv();

  if (!result.valid) {
    const errorMessage = [
      '❌ Missing required environment variables:',
      ...result.missing.map(key => `  - ${key}`),
      '',
      'Please check your .env.local file and ensure all required variables are set.',
      'See .env.example for reference.',
    ].join('\n');

    throw new Error(errorMessage);
  }

  if (result.warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Optional environment variables not set:');
    result.warnings.forEach(warning => console.warn(`  ${warning}`));
  }
}

/**
 * Type-safe environment variable accessor
 * Use this instead of process.env for better type safety
 */
export const env = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Patreon
  PATREON_CLIENT_ID: process.env.PATREON_CLIENT_ID || '',
  PATREON_CLIENT_SECRET: process.env.PATREON_CLIENT_SECRET || '',
  PATREON_REDIRECT_URI: process.env.PATREON_REDIRECT_URI || '',

  // Optional
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

/**
 * Check if we're in development mode
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if we're in production mode
 */
export const isProduction = env.NODE_ENV === 'production';
