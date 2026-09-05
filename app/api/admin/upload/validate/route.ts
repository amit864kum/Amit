import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin';
import { hasJsonContentType, noStoreHeaders, sameOriginRequest } from '@/lib/request-security';

function matchesSignature(type: string, bytes: Uint8Array) {
  if (type === 'image/png') return [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a].every((value, index) => bytes[index] === value);
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/webp') return new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF'
    && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP';
  if (type === 'application/pdf') {
    const prefix = new TextDecoder().decode(bytes.slice(0, 5));
    const suffix = new TextDecoder().decode(bytes.slice(Math.max(0, bytes.length - 2048)));
    return prefix === '%PDF-' && suffix.includes('%%EOF');
  }
  return false;
}

function validBlobUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch { return false; }
}

export async function POST(request: Request) {
  if (!sameOriginRequest(request) || !hasJsonContentType(request)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 403, headers: noStoreHeaders() });
  }
  if (!await requireAdminApi()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStoreHeaders() });
  const body = await request.json().catch(() => null) as { url?: string; type?: string; size?: number } | null;
  const url = body?.url || '';
  const type = body?.type || '';
  const maximum = type === 'application/pdf' ? 10_000_000 : 8_000_000;
  if (!validBlobUrl(url) || !['image/png', 'image/jpeg', 'image/webp', 'application/pdf'].includes(type) || !body?.size || body.size > maximum) {
    if (validBlobUrl(url)) await del(url).catch(() => undefined);
    return NextResponse.json({ error: 'Invalid upload.' }, { status: 400, headers: noStoreHeaders() });
  }
  try {
    const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10_000) });
    const contentLength = Number(response.headers.get('content-length') || 0);
    if (!response.ok || (contentLength && contentLength > maximum)) throw new Error('Invalid Blob response');
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length !== body.size || !matchesSignature(type, bytes)) throw new Error('Signature mismatch');
    return NextResponse.json({ url }, { headers: noStoreHeaders() });
  } catch {
    await del(url).catch(() => undefined);
    return NextResponse.json({ error: 'The uploaded file failed validation.' }, { status: 400, headers: noStoreHeaders() });
  }
}
