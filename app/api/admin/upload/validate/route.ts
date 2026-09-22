import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin';
import { hasJsonContentType, noStoreHeaders, sameOriginRequest } from '@/lib/request-security';
import { matchesUploadSignature, uploadMaximum, uploadTypes, validPublicBlobUrl, type UploadType } from '@/lib/upload-files';

export async function POST(request: Request) {
  if (!sameOriginRequest(request) || !hasJsonContentType(request)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 403, headers: noStoreHeaders() });
  }
  if (!await requireAdminApi()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStoreHeaders() });
  const body = await request.json().catch(() => null) as { url?: string; type?: string; size?: number } | null;
  const url = body?.url || '';
  const type = body?.type || '';
  const knownType = uploadTypes.includes(type as UploadType) ? type as UploadType : null;
  const maximum = knownType ? uploadMaximum(knownType) : 0;
  if (!validPublicBlobUrl(url) || !knownType || !body?.size || body.size > maximum) {
    if (validPublicBlobUrl(url)) await del(url).catch(() => undefined);
    return NextResponse.json({ error: 'Invalid upload.' }, { status: 400, headers: noStoreHeaders() });
  }
  try {
    const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10_000) });
    const contentLength = Number(response.headers.get('content-length') || 0);
    if (!response.ok || (contentLength && contentLength > maximum)) throw new Error('Invalid Blob response');
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length !== body.size || !matchesUploadSignature(knownType, bytes)) throw new Error('Signature mismatch');
    return NextResponse.json({ url }, { headers: noStoreHeaders() });
  } catch {
    await del(url).catch(() => undefined);
    return NextResponse.json({ error: 'The uploaded file failed validation.' }, { status: 400, headers: noStoreHeaders() });
  }
}
