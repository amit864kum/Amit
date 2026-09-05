import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { requireAdminApi } from '@/lib/admin';
import { noStoreHeaders, sameOriginRequest } from '@/lib/request-security';

const maximumUploadBytes = 10_000_000;

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

export async function POST(request: Request) {
  if (!sameOriginRequest(request)) return NextResponse.json({ error: 'Invalid request' }, { status: 403, headers: noStoreHeaders() });
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('multipart/form-data')) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 415, headers: noStoreHeaders() });
  }
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > maximumUploadBytes + 100_000) {
    return NextResponse.json({ error: 'Upload is too large.' }, { status: 413, headers: noStoreHeaders() });
  }
  if (!await requireAdminApi()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStoreHeaders() });
  const form = await request.formData();
  const file = form.get('file');
  const allowedTypes = ['image/png','image/jpeg','image/webp','application/pdf'];
  const limit = file instanceof File && file.type === 'application/pdf' ? 10_000_000 : 8_000_000;
  if (!(file instanceof File) || !allowedTypes.includes(file.type) || file.size > limit) return NextResponse.json({ error: 'Use a PNG, JPEG, or WebP under 8 MB, or a PDF under 10 MB.' }, { status: 400, headers: noStoreHeaders() });
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesSignature(file.type, bytes)) {
    return NextResponse.json({ error: 'The file contents do not match the selected file type.' }, { status: 400, headers: noStoreHeaders() });
  }
  const extensions: Record<string, string> = { 'application/pdf': 'pdf', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
  const extension = extensions[file.type];
  const folder = file.type === 'application/pdf' ? 'resumes/' : 'content/';
  const key = folder + crypto.randomUUID() + '.' + extension;
  await env.FILES.put(key, bytes, { httpMetadata: { contentType: file.type } });
  return NextResponse.json({ url: '/api/media/' + encodeURIComponent(key) }, { headers: noStoreHeaders() });
}
