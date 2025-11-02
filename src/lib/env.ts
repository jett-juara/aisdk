/**
 * Environment variables validation and configuration
 */

// Server-side environment variables
const serverEnv = {
  // GitHub
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  GITHUB_REPOSITORY_URL: process.env.GITHUB_REPOSITORY_URL,
  GITHUB_OWNER: process.env.GITHUB_OWNER,
  GITHUB_REPO: process.env.GITHUB_REPO,

  // Supabase (server-side only)
  SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE,
  SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
  SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,

  // AI Models (server-side)
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // Feature flags (server-side)
  STREAM_TIMEOUT_MS: process.env.STREAM_TIMEOUT_MS,
  GENERATE_TIMEOUT_MS: process.env.GENERATE_TIMEOUT_MS,
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
  WEB_SEARCH_ENABLE: process.env.WEB_SEARCH_ENABLE,

  // Vercel
  VERCEL_TOKEN: process.env.VERCEL_TOKEN,
} as const;

// Client-side environment variables
const clientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
} as const;

// Validation functions
export function validateServerEnv() {
  const required = [
    'OPENROUTER_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    return false;
  }

  return true;
}

export function validateClientEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_URL',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    return false;
  }

  return true;
}

// Export validated environment variables
export const env = {
  server: serverEnv,
  client: clientEnv,
};