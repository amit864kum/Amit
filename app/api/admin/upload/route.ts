import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { requireAdminApi } from '@/lib/admin';

export async function POST(request: Request) {
  if (!await requireAdminApi()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await request.formData();
  const file = form.get('file');
  const allowedTypes = ['image/png','image/jpeg','image/webp','application/pdf'];
  const limit = file instanceof File && file.type === 'application/pdf' ? 10_000_000 : 8_000_000;
  if (!(file instanceof File) || !allowedTypes.includes(file.type) || file.size > limit) return NextResponse.json({ error: 'Use a PNG, JPEG, or WebP under 8 MB, or a PDF under 10 MB.' }, { status: 400 });
  const extension = file.type === 'application/pdf' ? 'pdf' : file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const folder = file.type === 'application/pdf' ? 'resumes/' : 'content/';
  const key = folder + crypto.randomUUID() + '.' + extension;
  await env.FILES.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  return NextResponse.json({ url: '/api/media/' + encodeURIComponent(key) });
}
