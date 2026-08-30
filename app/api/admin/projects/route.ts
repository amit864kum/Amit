import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { requireAdminApi } from '@/lib/admin';
import { ensureContentTables } from '@/lib/content';
import { articleBlocks } from '@/lib/blog';

type ProjectPayload = {
  id?: number; slug: string; title: string; category: string; summary: string;
  body: string; contentJson?: string | null; tech: string; year: string; imageUrl?: string | null;
  projectUrl?: string | null; githubUrl?: string | null; featured?: number;
};

async function authorized() { await ensureContentTables(); return requireAdminApi(); }
function normalizeContent(value: string | null | undefined) {
  if (!value) return null;
  const raw = JSON.parse(value) as unknown;
  if (!Array.isArray(raw) || raw.length > 80) throw new Error('Invalid content blocks');
  if (!raw.length) return null;
  const blocks = articleBlocks(value, '');
  if (blocks.length !== raw.length) throw new Error('Invalid content blocks');
  if (new Set(blocks.map((block) => block.id)).size !== blocks.length) throw new Error('Duplicate content block IDs');
  if (!blocks.some((block) => block.type === 'heading')) throw new Error('Project content needs a heading');
  for (const block of blocks) {
    if (block.type === 'heading' && !block.heading?.trim()) throw new Error('Every heading needs text');
    if (block.type === 'paragraph' && !block.text?.trim()) throw new Error('Every paragraph needs text');
    if (block.type === 'image' && (!block.imageUrl || !block.alt?.trim())) throw new Error('Every image needs a file and alt text');
  }
  return JSON.stringify(blocks);
}
export async function POST(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const p = await request.json() as ProjectPayload;
  let contentJson: string | null;
  try { contentJson = normalizeContent(p.contentJson); }
  catch { return NextResponse.json({ error: 'Invalid project content' }, { status: 400 }); }
  const order = await env.DB.prepare('SELECT COALESCE(MAX(display_order), -1) + 1 AS nextOrder FROM projects').first<{ nextOrder: number }>();
  await env.DB.prepare('INSERT INTO projects (slug,title,category,summary,body,content_json,tech,year,image_url,project_url,github_url,featured,display_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(p.slug,p.title,p.category,p.summary,p.body,contentJson,p.tech,p.year,p.imageUrl||null,p.projectUrl||null,p.githubUrl||null,p.featured?1:0,order?.nextOrder ?? 0).run();
  return NextResponse.json({ ok: true });
}
export async function PATCH(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const p = await request.json() as ProjectPayload;
  let contentJson: string | null;
  try {
    if (p.contentJson === undefined) {
      const existing = await env.DB.prepare('SELECT content_json AS contentJson FROM projects WHERE id=?').bind(p.id).first<{ contentJson: string | null }>();
      contentJson = existing?.contentJson ?? null;
    } else {
      contentJson = normalizeContent(p.contentJson);
    }
  }
  catch { return NextResponse.json({ error: 'Invalid project content' }, { status: 400 }); }
  await env.DB.prepare('UPDATE projects SET slug=?,title=?,category=?,summary=?,body=?,content_json=?,tech=?,year=?,image_url=?,project_url=?,github_url=?,featured=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(p.slug,p.title,p.category,p.summary,p.body,contentJson,p.tech,p.year,p.imageUrl||null,p.projectUrl||null,p.githubUrl||null,p.featured?1:0,p.id).run();
  return NextResponse.json({ ok: true });
}
export async function DELETE(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await request.json() as { id: number };
  await env.DB.prepare('DELETE FROM projects WHERE id=?').bind(id).run();
  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { ids } = await request.json() as { ids?: number[] };
  if (!Array.isArray(ids) || !ids.length || ids.some((id) => !Number.isInteger(id)) || new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: 'Invalid project order' }, { status: 400 });
  }
  const existing = (await env.DB.prepare('SELECT id FROM projects').all<{ id: number }>()).results;
  const existingIds = new Set(existing.map((item) => item.id));
  if (existingIds.size !== ids.length || ids.some((id) => !existingIds.has(id))) {
    return NextResponse.json({ error: 'Project list changed; refresh and try again' }, { status: 409 });
  }
  await env.DB.batch(ids.map((id, index) => env.DB.prepare('UPDATE projects SET display_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(index, id)));
  return NextResponse.json({ ok: true });
}
