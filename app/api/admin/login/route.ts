import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminSessionMaxAge, createAdminToken, verifyAdminCredentials } from '@/lib/admin';

export async function POST(request: Request) {
  const body = await request.json() as { username?: string; password?: string };
  const username = String(body.username ?? '').slice(0, 80);
  const password = String(body.password ?? '').slice(0, 256);
  if (!await verifyAdminCredentials(username, password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, await createAdminToken(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: adminSessionMaxAge,
  });
  return response;
}
