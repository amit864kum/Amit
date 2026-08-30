import { NextResponse } from 'next/server';
import { recordConsent } from '@/lib/analytics';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { choice?: string } | null;
  if (!body || (body.choice !== 'accepted' && body.choice !== 'rejected')) {
    return NextResponse.json({ error: 'Invalid consent choice.' }, { status: 400 });
  }
  await recordConsent(body.choice);
  return NextResponse.json({ ok: true });
}
