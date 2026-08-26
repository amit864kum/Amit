import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { requireAdminApi } from '@/lib/admin';

export async function POST(request: Request) {
  if (!await requireAdminApi()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File) || !['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 8_000_000) return NextResponse.json({ error: 'Use a PNG, JPEG, or WebP under 8 MB.' }, { status: 400 });
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const key = 'projects/' + crypto.randomUUID() + '.' + extension;
  await env.FILES.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  return NextResponse.json({ url: '/api/media/' + encodeURIComponent(key) });
}
