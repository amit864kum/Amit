import { env } from 'cloudflare:workers';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminPasswordHash } from '@/lib/admin-security';
import { verifyPassword } from '@/lib/security-crypto';

export const ADMIN_COOKIE = 'amit_admin_session';
const SESSION_SECONDS = 60 * 60 * 12;

function config(name: 'ADMIN_USERNAME' | 'ADMIN_PASSWORD_HASH' | 'ADMIN_SESSION_SECRET') {
  const runtime = env as unknown as Record<string, string | undefined>;
  return runtime[name] ?? process.env[name] ?? '';
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
function base64UrlToBytes(value: string) {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
function safeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let i = 0; i < left.length; i += 1) difference |= left[i] ^ right[i];
  return difference === 0;
}

export async function verifyAdminCredentials(username: string, password: string) {
  if (!username || username !== config('ADMIN_USERNAME')) return false;
  return verifyPassword(password, await getAdminPasswordHash(username));
}

async function sign(value: string) {
  const secret = config('ADMIN_SESSION_SECRET');
  if (secret.length < 32) return '';
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))));
}

export async function createAdminToken(username: string) {
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({
    username,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
    nonce: crypto.randomUUID(),
  })));
  return payload + '.' + await sign(payload);
}

export async function isAdminSession() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  try {
    const expected = await sign(payload);
    if (!expected || !safeEqual(base64UrlToBytes(signature), base64UrlToBytes(expected))) return false;
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as { username?: string; expiresAt?: number };
    return data.username === config('ADMIN_USERNAME') && Number(data.expiresAt) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function requireAdminPage() {
  if (!await isAdminSession()) redirect('/admin/login');
}
export async function requireAdminApi() {
  return isAdminSession();
}

export const adminSessionMaxAge = SESSION_SECONDS;
