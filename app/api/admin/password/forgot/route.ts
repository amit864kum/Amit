import { NextResponse } from 'next/server';
import { requestAdminReset } from '@/lib/admin-security';
import { hasJsonContentType, noStoreHeaders, rateLimit, sameOriginRequest } from '@/lib/request-security';

export async function POST(request: Request) {
  try {
    if (!sameOriginRequest(request)) return NextResponse.json({ error: 'Invalid request' }, { status: 403, headers: noStoreHeaders() });
    if (!hasJsonContentType(request)) return NextResponse.json({ error: 'Invalid request' }, { status: 415, headers: noStoreHeaders() });
    const throttle = await rateLimit(request, { scope: 'admin-forgot', limit: 4, windowSeconds: 15 * 60 });
    if (!throttle.allowed) return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429, headers: noStoreHeaders({ 'retry-after': String(throttle.retryAfter) }) });
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: noStoreHeaders() });
    const result = await requestAdminReset();
    return NextResponse.json({ ok: true, destination: result.destination }, { status: 202, headers: noStoreHeaders() });
  } catch (error) {
    console.error('Admin password reset request failed', error);
    return NextResponse.json({ error: 'Password recovery is temporarily unavailable. Please try again.' }, { status: 503, headers: noStoreHeaders() });
  }
}
