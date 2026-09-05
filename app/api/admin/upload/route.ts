import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin';
import { hasJsonContentType, noStoreHeaders, rateLimit, sameOriginRequest } from '@/lib/request-security';

const imageTypes = ['image/png', 'image/jpeg', 'image/webp'];

export async function POST(request: Request) {
  if (!hasJsonContentType(request)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 415, headers: noStoreHeaders() });
  }
  const body = await request.json().catch(() => null) as HandleUploadBody | null;
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: noStoreHeaders() });

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!sameOriginRequest(request) || !await requireAdminApi()) throw new Error('Unauthorized');
        const throttle = await rateLimit(request, { scope: 'admin-upload', limit: 30, windowSeconds: 15 * 60 });
        if (!throttle.allowed) throw new Error('Upload rate limit exceeded');
        const payload = JSON.parse(clientPayload || '{}') as { kind?: string };
        const resume = payload.kind === 'resume';
        const validPath = resume
          ? /^resumes\/[a-f0-9-]+\.pdf$/i.test(pathname)
          : /^content\/[a-f0-9-]+\.(png|jpe?g|webp)$/i.test(pathname);
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
  } catch {
    return NextResponse.json({ error: 'Upload authorization failed.' }, { status: 400, headers: noStoreHeaders() });
  }
}
