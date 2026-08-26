import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { requireAdminApi } from '@/lib/admin';
import { ensureContentTables } from '@/lib/content';

type PostPayload = {
  id?: number; slug: string; title: string; excerpt: string; body: string;
  category: string; imageUrl?: string | null; featured?: number;
  publishedAt: string; published?: number;
};

async function authorized() { await ensureContentTables(); return requireAdminApi(); }
export async function POST(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const p = await request.json() as PostPayload;
  await env.DB.prepare('INSERT INTO posts (slug,title,excerpt,body,category,image_url,featured,published_at,published) VALUES (?,?,?,?,?,?,?,?,?)').bind(p.slug,p.title,p.excerpt,p.body,p.category,p.imageUrl||null,p.featured?1:0,p.publishedAt,p.published?1:0).run();
  return NextResponse.json({ ok: true });
}
export async function PATCH(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const p = await request.json() as PostPayload;
  await env.DB.prepare('UPDATE posts SET slug=?,title=?,excerpt=?,body=?,category=?,image_url=?,featured=?,published_at=?,published=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(p.slug,p.title,p.excerpt,p.body,p.category,p.imageUrl||null,p.featured?1:0,p.publishedAt,p.published?1:0,p.id).run();
  return NextResponse.json({ ok: true });
}
export async function DELETE(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await request.json() as { id: number };
  await env.DB.prepare('DELETE FROM posts WHERE id=?').bind(id).run();
  return NextResponse.json({ ok: true });
}
