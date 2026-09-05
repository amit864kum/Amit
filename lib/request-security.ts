import { config } from '@/lib/env';
import { database } from '@/db';

type RateLimitOptions = { scope: string; limit: number; windowSeconds: number };

function requestAddress(request: Request) {
  return request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || (process.env.NODE_ENV !== 'production' ? 'local' : 'unknown');
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
  await database.prepare("DELETE FROM rate_limits WHERE updated_at < NOW() - INTERVAL '1 day'").run();
  const key = await identifier(request, options.scope);
  const now = Math.floor(Date.now() / 1000);
  const resetBefore = now - options.windowSeconds;
  const row = await database.prepare(`INSERT INTO rate_limits (key,window_start,count,updated_at)
    VALUES (?, ?, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET
      count=CASE WHEN rate_limits.window_start <= ? THEN 1 ELSE rate_limits.count + 1 END,
      window_start=CASE WHEN rate_limits.window_start <= ? THEN excluded.window_start ELSE rate_limits.window_start END,
      updated_at=CURRENT_TIMESTAMP
    RETURNING count,window_start AS "windowStart"`).bind(key, now, resetBefore, resetBefore)
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
  if (fetchSite === 'same-origin') return true;
  if (fetchSite && fetchSite !== 'none') return false;
  if (!origin) return false;
  try {
    const requestOrigin = new URL(request.url).origin;
    const configuredOrigin = config('SITE_URL');
    return origin === requestOrigin || Boolean(configuredOrigin && origin === new URL(configuredOrigin).origin);
  } catch { return false; }
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
  return Number.isFinite(started) && started > 0 && elapsed >= 0 && elapsed <= 2 * 60 * 60 * 1000;
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
    const allowedHostnames = new Set<string>();
    try { allowedHostnames.add(new URL(config('SITE_URL')).hostname); } catch { /* Optional when the browser origin is available. */ }
    try { allowedHostnames.add(new URL(request.headers.get('origin') || '').hostname); } catch { /* Invalid origins fail verification. */ }
    return {
      required: true,
      success: Boolean(result.success && result.action === 'contact' && result.hostname && allowedHostnames.has(result.hostname)),
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
