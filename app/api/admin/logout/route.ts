import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/admin';
import { noStoreHeaders, sameOriginRequest } from '@/lib/request-security';

export async function POST(request: Request) {
  if (!sameOriginRequest(request)) return new Response('Invalid request', { status: 403, headers: noStoreHeaders() });
  const response = NextResponse.redirect(new URL('/admin/login', request.url), 303);
  for (const [name, value] of noStoreHeaders()) response.headers.set(name, value);
  response.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
  return response;
}
