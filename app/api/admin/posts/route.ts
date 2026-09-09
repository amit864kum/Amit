import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdminApi } from '@/lib/admin';
import { database } from '@/db';
import { ensureContentTables } from '@/lib/content';
import { hasJsonContentType, noStoreHeaders, sameOriginRequest } from '@/lib/request-security';
import { deleteManagedBlobsIfUnreferenced, managedBlobUrls } from '@/lib/blob-storage';

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
  await database.prepare('INSERT INTO posts (slug,title,excerpt,body,content_json,category,image_url,featured,published_at,published) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(p.slug,p.title,p.excerpt,p.body,p.contentJson||null,p.category,p.imageUrl||null,p.featured?1:0,p.publishedAt,p.published?1:0).run();
  revalidatePath('/blog', 'layout');
  revalidateTag('posts', 'max');
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
}
export async function PATCH(request: Request) {
  if (!await authorized(request)) return NextResponse.json({ error: 'Unauthorized or invalid request' }, { status: 403, headers: noStoreHeaders() });
  const p = await request.json() as PostPayload;
  const existing = await database.prepare('SELECT image_url AS "imageUrl",content_json AS "contentJson" FROM posts WHERE id=?').bind(p.id).first<{ imageUrl: string | null; contentJson: string | null }>();
  if (!existing) return NextResponse.json({ error: 'Article not found' }, { status: 404, headers: noStoreHeaders() });
  await database.prepare('UPDATE posts SET slug=?,title=?,excerpt=?,body=?,content_json=?,category=?,image_url=?,featured=?,published_at=?,published=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(p.slug,p.title,p.excerpt,p.body,p.contentJson||null,p.category,p.imageUrl||null,p.featured?1:0,p.publishedAt,p.published?1:0,p.id).run();
  const retained = managedBlobUrls(p.imageUrl, p.contentJson);
  const removed = [...managedBlobUrls(existing.imageUrl, existing.contentJson)].filter((url) => !retained.has(url));
  await deleteManagedBlobsIfUnreferenced(removed);
  revalidatePath('/blog', 'layout');
  revalidateTag('posts', 'max');
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
}
export async function DELETE(request: Request) {
  if (!await authorized(request)) return NextResponse.json({ error: 'Unauthorized or invalid request' }, { status: 403, headers: noStoreHeaders() });
  const { id } = await request.json() as { id: number };
  const existing = await database.prepare('SELECT image_url AS "imageUrl",content_json AS "contentJson" FROM posts WHERE id=?').bind(id).first<{ imageUrl: string | null; contentJson: string | null }>();
  await database.prepare('DELETE FROM posts WHERE id=?').bind(id).run();
  if (existing) await deleteManagedBlobsIfUnreferenced(managedBlobUrls(existing.imageUrl, existing.contentJson));
  revalidatePath('/blog', 'layout');
  revalidateTag('posts', 'max');
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
}
