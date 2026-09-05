import { env } from 'cloudflare:workers';

export type ConfigKey =
  | 'SITE_URL'
  | 'ADMIN_USERNAME'
  | 'ADMIN_PASSWORD_HASH'
  | 'ADMIN_SESSION_SECRET'
  | 'ADMIN_EMAIL'
  | 'RESEND_API_KEY'
  | 'RESEND_FROM_EMAIL'
  | 'GOOGLE_SITE_VERIFICATION'
  | 'NEXT_PUBLIC_TURNSTILE_SITE_KEY'
  | 'TURNSTILE_SECRET_KEY';

export function config(name: ConfigKey) {
  const runtime = env as unknown as Record<string, string | undefined>;
  return (runtime[name] ?? process.env[name] ?? '').trim();
}

export function siteUrl() {
  const configured = config('SITE_URL');
  try {
    const url = new URL(configured || 'http://localhost:3000');
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
      throw new Error('SITE_URL must use HTTPS in production.');
    }
    return url;
  } catch (error) {
    if (error instanceof Error && error.message.includes('HTTPS')) throw error;
    throw new Error('SITE_URL must be a valid absolute URL.');
  }
}

export const productionRequiredConfig: ConfigKey[] = [
  'SITE_URL',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD_HASH',
  'ADMIN_SESSION_SECRET',
  'ADMIN_EMAIL',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
  'TURNSTILE_SECRET_KEY',
];

export function productionConfigStatus() {
  return productionRequiredConfig.map((name) => ({ name, configured: Boolean(config(name)) }));
}
