import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminSessionMaxAge, createAdminToken, verifyAdminCredentials } from '@/lib/admin';
import { hasJsonContentType, noStoreHeaders, rateLimit, sameOriginRequest } from '@/lib/request-security';

export async function POST(request: Request) {
  if (!sameOriginRequest(request)) return NextResponse.json({ error: 'Invalid request' }, { status: 403, headers: noStoreHeaders() });
  if (!hasJsonContentType(request)) return NextResponse.json({ error: 'Invalid request' }, { status: 415, headers: noStoreHeaders() });
  const throttle = await rateLimit(request, { scope: 'admin-login', limit: 6, windowSeconds: 15 * 60 });
  if (!throttle.allowed) return NextResponse.json({ error: 'Too many sign-in attempts. Try again later.' }, { status: 429, headers: noStoreHeaders({ 'retry-after': String(throttle.retryAfter) }) });
  const body = await request.json().catch(() => null) as { username?: string; password?: string } | null;
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: noStoreHeaders() });
  const username = String(body.username ?? '').slice(0, 80);
  const password = String(body.password ?? '').slice(0, 256);
  if (!await verifyAdminCredentials(username, password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: noStoreHeaders() });
  }
  const response = NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
  response.cookies.set(ADMIN_COOKIE, await createAdminToken(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: adminSessionMaxAge,
  });
  return response;
}
