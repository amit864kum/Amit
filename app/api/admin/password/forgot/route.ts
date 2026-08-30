import { NextResponse } from 'next/server';
import { requestAdminReset } from '@/lib/admin-security';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { identifier?: string } | null;
  const identifier = String(body?.identifier || '').slice(0, 160);
  if (!identifier) return NextResponse.json({ error: 'Enter your username or email.' }, { status: 400 });
  const result = await requestAdminReset(identifier);
  if (!result.accepted) return NextResponse.json({ error: result.error }, { status: result.error?.startsWith('Too many') ? 429 : 503 });
  return NextResponse.json({ ok: true, destination: result.destination, previewCode: result.previewCode });
}
