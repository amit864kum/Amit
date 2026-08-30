import { NextResponse } from 'next/server';
import { resetAdminPassword } from '@/lib/admin-security';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { code?: string; password?: string } | null;
  const code = String(body?.code || '').replace(/\D/g, '').slice(0, 6);
  const password = String(body?.password || '').slice(0, 128);
  if (code.length !== 6) return NextResponse.json({ error: 'Enter the six-digit verification code.' }, { status: 400 });
  const result = await resetAdminPassword(code, password);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
