import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { requireAdminApi } from '@/lib/admin';
import { ensureContentTables } from '@/lib/content';

async function authorized() { await ensureContentTables(); return requireAdminApi(); }
export async function POST(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const p = await request.json() as Record<string, any>;
  await env.DB.prepare('INSERT INTO projects (slug,title,category,summary,body,tech,year,image_url,project_url,github_url,featured) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(p.slug,p.title,p.category,p.summary,p.body,p.tech,p.year,p.imageUrl||null,p.projectUrl||null,p.githubUrl||null,p.featured?1:0).run();
  return NextResponse.json({ ok: true });
}
export async function PATCH(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const p = await request.json() as Record<string, any>;
  await env.DB.prepare('UPDATE projects SET slug=?,title=?,category=?,summary=?,body=?,tech=?,year=?,image_url=?,project_url=?,github_url=?,featured=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(p.slug,p.title,p.category,p.summary,p.body,p.tech,p.year,p.imageUrl||null,p.projectUrl||null,p.githubUrl||null,p.featured?1:0,p.id).run();
  return NextResponse.json({ ok: true });
}
export async function DELETE(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await request.json() as { id: number };
  await env.DB.prepare('DELETE FROM projects WHERE id=?').bind(id).run();
  return NextResponse.json({ ok: true });
}
