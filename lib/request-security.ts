import { env } from 'cloudflare:workers';
import { config } from '@/lib/env';

type RateLimitOptions = { scope: string; limit: number; windowSeconds: number };

let rateLimitInitialization: Promise<void> | null = null;

async function ensureRateLimitTable() {
  if (!rateLimitInitialization) {
    rateLimitInitialization = env.DB.batch([
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT PRIMARY KEY,
        window_start INTEGER NOT NULL,
        count INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`),
      env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_rate_limits_updated ON rate_limits(updated_at)'),
    ]).then(() => undefined).catch((error) => {
      rateLimitInitialization = null;
      throw error;
    });
  }
  return rateLimitInitialization;
}

function requestAddress(request: Request) {
  const cloudflareAddress = request.headers.get('cf-connecting-ip');
  if (cloudflareAddress) return cloudflareAddress;
  if (process.env.NODE_ENV !== 'production') {
    return request.headers.get('x-real-ip')
      || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || 'local';
  }
  return 'unknown';
}

function toBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

async function identifier(request: Request, scope: string) {
  const secret = config('ADMIN_SESSION_SECRET') || 'local-development-rate-limit';
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const value = `${scope}:${requestAddress(request)}`;
  return toBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))));
}

export async function rateLimit(request: Request, options: RateLimitOptions) {
  await ensureRateLimitTable();
  await env.DB.prepare(`DELETE FROM rate_limits WHERE key IN (
    SELECT key FROM rate_limits WHERE datetime(updated_at) < datetime('now', '-1 day') LIMIT 100
  )`).run();
  const key = await identifier(request, options.scope);
  const now = Math.floor(Date.now() / 1000);
  const resetBefore = now - options.windowSeconds;
  const row = await env.DB.prepare(`INSERT INTO rate_limits (key,window_start,count,updated_at)
    VALUES (?, ?, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET
      count=CASE WHEN rate_limits.window_start <= ? THEN 1 ELSE rate_limits.count + 1 END,
      window_start=CASE WHEN rate_limits.window_start <= ? THEN excluded.window_start ELSE rate_limits.window_start END,
      updated_at=CURRENT_TIMESTAMP
    RETURNING count,window_start AS windowStart`).bind(key, now, resetBefore, resetBefore)
    .first<{ count: number; windowStart: number }>();
  const count = Number(row?.count || 1);
  const windowStart = Number(row?.windowStart || now);
  return {
    allowed: count <= options.limit,
    remaining: Math.max(0, options.limit - count),
    retryAfter: Math.max(1, windowStart + options.windowSeconds - now),
  };
}

export function sameOriginRequest(request: Request) {
  const origin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');
  if (!origin) return fetchSite === 'same-origin';
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}

export function hasJsonContentType(request: Request) {
  return request.headers.get('content-type')?.toLowerCase().startsWith('application/json') === true;
}

export function cookieValue(request: Request, name: string) {
  const pair = request.headers.get('cookie')?.split(';').map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : '';
}

export function noStoreHeaders(extra?: HeadersInit) {
  const headers = new Headers(extra);
  headers.set('cache-control', 'no-store, max-age=0');
  headers.set('pragma', 'no-cache');
  return headers;
}

export function validSubmissionTiming(value: string) {
  const started = Number(value);
  const elapsed = Date.now() - started;
  return Number.isFinite(started) && elapsed >= 2500 && elapsed <= 2 * 60 * 60 * 1000;
}

export async function verifyTurnstile(token: string, request: Request) {
  const secret = config('TURNSTILE_SECRET_KEY');
  if (!secret) return { required: process.env.NODE_ENV === 'production', success: process.env.NODE_ENV !== 'production' };
  if (!token) return { required: true, success: false };
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: requestAddress(request) }),
      signal: AbortSignal.timeout(6000),
    });
    const result = await response.json() as { success?: boolean; action?: string; hostname?: string };
    let expectedHostname = '';
    try { expectedHostname = new URL(config('SITE_URL')).hostname; } catch { /* Invalid production config fails verification. */ }
    return {
      required: true,
      success: Boolean(result.success && result.action === 'contact' && expectedHostname && result.hostname === expectedHostname),
    };
  } catch {
    return { required: true, success: false };
  }
}

export function looksLikeSpam(values: string[]) {
  const combined = values.join(' ');
  const urls = combined.match(/https?:\/\/|www\./gi)?.length || 0;
  return urls > 4 || /(.)\1{12,}/i.test(combined);
}
