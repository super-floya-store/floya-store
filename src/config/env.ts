import { z } from 'zod'

const normalizeUrl = (value: unknown) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.preprocess(normalizeUrl, z.string().url()),
  NEXT_PUBLIC_APP_NAME: z.string().default('Floya Store'),
  NEXT_PUBLIC_SUPABASE_URL: z.preprocess(normalizeUrl, z.string().url()),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(64),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  UPLOAD_MAX_SIZE: z.string().default('5242880'),
  UPLOAD_ALLOWED_TYPES: z.string().default('image/jpeg,image/png,image/webp'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  STORE_EMAIL: z.string().email().default('store@floya.dz'),
  SUPABASE_STORAGE_BUCKET: z.string().default('store-media'),
  RATE_LIMIT_AUTH_MAX: z.string().default('5'),
  RATE_LIMIT_AUTH_WINDOW: z.string().default('900000'),
  RATE_LIMIT_API_MAX: z.string().default('100'),
  RATE_LIMIT_API_WINDOW: z.string().default('60000'),
})

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY,
  UPLOAD_MAX_SIZE: process.env.UPLOAD_MAX_SIZE,
  UPLOAD_ALLOWED_TYPES: process.env.UPLOAD_ALLOWED_TYPES,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  STORE_EMAIL: process.env.STORE_EMAIL,
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,
  RATE_LIMIT_AUTH_MAX: process.env.RATE_LIMIT_AUTH_MAX,
  RATE_LIMIT_AUTH_WINDOW: process.env.RATE_LIMIT_AUTH_WINDOW,
  RATE_LIMIT_API_MAX: process.env.RATE_LIMIT_API_MAX,
  RATE_LIMIT_API_WINDOW: process.env.RATE_LIMIT_API_WINDOW,
})
