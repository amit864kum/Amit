import { NextResponse } from 'next/server';
import { resetAdminPassword } from '@/lib/admin-security';
import { hasJsonContentType, noStoreHeaders, rateLimit, sameOriginRequest } from '@/lib/request-security';

export async function POST(request: Request) {
  try {
    if (!sameOriginRequest(request)) return NextResponse.json({ error: 'Invalid request' }, { status: 403, headers: noStoreHeaders() });
    if (!hasJsonContentType(request)) return NextResponse.json({ error: 'Invalid request' }, { status: 415, headers: noStoreHeaders() });
    const throttle = await rateLimit(request, { scope: 'admin-reset', limit: 10, windowSeconds: 15 * 60 });
    if (!throttle.allowed) return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429, headers: noStoreHeaders({ 'retry-after': String(throttle.retryAfter) }) });
    const body = await request.json().catch(() => null) as { code?: string; password?: string } | null;
    const code = String(body?.code || '').replace(/\D/g, '').slice(0, 6);
    const password = String(body?.password || '').slice(0, 128);
    if (code.length !== 6) return NextResponse.json({ error: 'Enter the six-digit verification code.' }, { status: 400, headers: noStoreHeaders() });
    const result = await resetAdminPassword(code, password);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400, headers: noStoreHeaders() });
    return NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
  } catch (error) {
    console.error('Admin password reset failed', error);
    return NextResponse.json({ error: 'The password could not be updated. Please request a new code and try again.' }, { status: 503, headers: noStoreHeaders() });
  }
}
