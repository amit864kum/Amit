import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { requireAdminApi } from '@/lib/admin';
import { ensureContentTables } from '@/lib/content';
import { hasJsonContentType, noStoreHeaders, sameOriginRequest } from '@/lib/request-security';

type PostPayload = {
  id?: number; slug: string; title: string; excerpt: string; body: string;
  contentJson?: string | null;
  category: string; imageUrl?: string | null; featured?: number;
  publishedAt: string; published?: number;
};

async function authorized(request: Request) {
  if (!sameOriginRequest(request) || !hasJsonContentType(request)) return false;
  await ensureContentTables();
  return requireAdminApi();
}
export async function POST(request: Request) {
  if (!await authorized(request)) return NextResponse.json({ error: 'Unauthorized or invalid request' }, { status: 403, headers: noStoreHeaders() });
  const p = await request.json() as PostPayload;
  await env.DB.prepare('INSERT INTO posts (slug,title,excerpt,body,content_json,category,image_url,featured,published_at,published) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(p.slug,p.title,p.excerpt,p.body,p.contentJson||null,p.category,p.imageUrl||null,p.featured?1:0,p.publishedAt,p.published?1:0).run();
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
}
export async function PATCH(request: Request) {
  if (!await authorized(request)) return NextResponse.json({ error: 'Unauthorized or invalid request' }, { status: 403, headers: noStoreHeaders() });
  const p = await request.json() as PostPayload;
  await env.DB.prepare('UPDATE posts SET slug=?,title=?,excerpt=?,body=?,content_json=?,category=?,image_url=?,featured=?,published_at=?,published=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(p.slug,p.title,p.excerpt,p.body,p.contentJson||null,p.category,p.imageUrl||null,p.featured?1:0,p.publishedAt,p.published?1:0,p.id).run();
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
}
export async function DELETE(request: Request) {
  if (!await authorized(request)) return NextResponse.json({ error: 'Unauthorized or invalid request' }, { status: 403, headers: noStoreHeaders() });
  const { id } = await request.json() as { id: number };
  await env.DB.prepare('DELETE FROM posts WHERE id=?').bind(id).run();
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
}
