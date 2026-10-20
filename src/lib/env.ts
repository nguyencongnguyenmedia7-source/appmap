import { z } from 'zod';

/**
 * Validated Environment Variables Schema
 * Safely parses Expo public variables without exposing secrets.
 */
const envSchema = z.object({
  MAPBOX_ACCESS_TOKEN: z.string().optional().default(''),
  MAPBOX_STYLE_URL: z
    .string()
    .optional()
    .default('mapbox://styles/mapbox/standard'),
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_ANON_KEY: z.string().optional().default(''),
  APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ENABLE_MAP_TELEMETRY: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .default(true),
});

export const env = envSchema.parse({
  MAPBOX_ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
  MAPBOX_STYLE_URL: process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL,
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  ENABLE_MAP_TELEMETRY: process.env.EXPO_PUBLIC_ENABLE_MAP_TELEMETRY,
});

export const isMapboxConfigured = Boolean(
  env.MAPBOX_ACCESS_TOKEN &&
    env.MAPBOX_ACCESS_TOKEN.startsWith('pk.') &&
    !env.MAPBOX_ACCESS_TOKEN.includes('example')
);

export const isSupabaseConfigured = Boolean(
  env.SUPABASE_URL &&
    env.SUPABASE_URL.startsWith('http') &&
    !env.SUPABASE_URL.includes('your-project-id') &&
    env.SUPABASE_ANON_KEY &&
    !env.SUPABASE_ANON_KEY.includes('your-anon-key')
);
