import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin';
import { hasJsonContentType, noStoreHeaders, rateLimit, sameOriginRequest } from '@/lib/request-security';
import { config } from '@/lib/env';

const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

export async function POST(request: Request) {
  if (!hasJsonContentType(request)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 415, headers: noStoreHeaders() });
  }
  const body = await request.json().catch(() => null) as HandleUploadBody | null;
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: noStoreHeaders() });
  const blobToken = config('BLOB_READ_WRITE_TOKEN');
  if (!blobToken && !process.env.VERCEL_OIDC_TOKEN) {
    return NextResponse.json({ error: 'Vercel Blob storage is not configured for this environment.' }, { status: 503, headers: noStoreHeaders() });
  }

  try {
    const result = await handleUpload({
      body,
      request,
      token: blobToken || undefined,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!sameOriginRequest(request) || !await requireAdminApi()) throw new Error('Unauthorized');
        const throttle = await rateLimit(request, { scope: 'admin-upload', limit: 30, windowSeconds: 15 * 60 });
        if (!throttle.allowed) throw new Error('Upload rate limit exceeded');
        const payload = JSON.parse(clientPayload || '{}') as { kind?: string };
        const resume = payload.kind === 'resume';
        const validPath = resume
          ? /^resumes\/[a-f0-9-]+\.pdf$/i.test(pathname)
          : /^content\/[a-f0-9-]+\.(png|jpe?g|webp|avif)$/i.test(pathname);
        if (!validPath) throw new Error('Invalid upload path');
        return {
          allowedContentTypes: resume ? ['application/pdf'] : imageTypes,
          maximumSizeInBytes: resume ? 10_000_000 : 8_000_000,
          addRandomSuffix: false,
          allowOverwrite: false,
          tokenPayload: JSON.stringify({ kind: resume ? 'resume' : 'image' }),
        };
      },
      onUploadCompleted: async () => undefined,
    });
    return NextResponse.json(result, { headers: noStoreHeaders() });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const safeMessage = /rate limit/i.test(message)
      ? 'The upload limit was reached. Wait a few minutes and try again.'
      : /unauthorized/i.test(message)
        ? 'Your admin session expired. Sign in again before uploading.'
        : 'The upload could not be authorized by Vercel Blob.';
    return NextResponse.json({ error: safeMessage }, { status: 400, headers: noStoreHeaders() });
  }
}
