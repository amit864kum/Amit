import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { database } from '@/db';
import { requireAdminApi } from '@/lib/admin';
import { ensureContentTables } from '@/lib/content';
import { articleBlocks } from '@/lib/blog';
import { toProjectSlug } from '@/lib/slug';
import { projectDetails, type ProjectDestination } from '@/lib/project-details';
import { hasJsonContentType, noStoreHeaders, sameOriginRequest } from '@/lib/request-security';
import { deleteManagedBlobsIfUnreferenced, managedBlobUrls } from '@/lib/blob-storage';

type ProjectPayload = {
  id?: number; slug: string; title: string; category: string; summary: string;
  body: string; contentJson?: string | null; tech: string; year: string; imageUrl?: string | null;
  projectUrl?: string | null; githubUrl?: string | null; featured?: number; destination?: ProjectDestination;
  published?: number; showOnProjects?: number; detailJson?: string | null;
};

async function authorized(request: Request) {
  if (!sameOriginRequest(request) || !hasJsonContentType(request)) return false;
  await ensureContentTables();
  return requireAdminApi();
}
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
function normalizeDetails(value: string | null | undefined) {
  if (!value) return null;
  const parsed = JSON.parse(value) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid project details');
  return JSON.stringify(projectDetails(value));
}
function normalizeDestination(p: ProjectPayload): ProjectDestination {
  const destination = p.destination || 'case_study';
  if (!['case_study', 'live', 'github'].includes(destination)) throw new Error('Invalid project destination');
  if (destination === 'live' && !p.projectUrl) throw new Error('A live URL is required');
  if (destination === 'github' && !p.githubUrl) throw new Error('A GitHub URL is required');
  return destination;
}
export async function POST(request: Request) {
  if (!await authorized(request)) return NextResponse.json({ error: 'Unauthorized or invalid request' }, { status: 403, headers: noStoreHeaders() });
  const p = await request.json() as ProjectPayload;
  let contentJson: string | null; let detailJson: string | null; let destination: ProjectDestination;
  try { contentJson = normalizeContent(p.contentJson); detailJson = normalizeDetails(p.detailJson); destination = normalizeDestination(p); }
  catch { return NextResponse.json({ error: 'Invalid project content' }, { status: 400 }); }
  const slug = toProjectSlug(p.slug || p.title);
  if (!slug) return NextResponse.json({ error: 'A valid project title or slug is required' }, { status: 400 });
  const order = await database.prepare('SELECT COALESCE(MAX(display_order), -1) + 1 AS "nextOrder" FROM projects').first<{ nextOrder: number }>();
  try {
    await database.prepare('INSERT INTO projects (slug,title,category,summary,body,content_json,tech,year,image_url,project_url,github_url,featured,destination,published,show_on_projects,detail_json,display_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(slug,p.title,p.category,p.summary,p.body,contentJson,p.tech,p.year,p.imageUrl||null,p.projectUrl||null,p.githubUrl||null,p.featured?1:0,destination,p.published?1:0,p.showOnProjects?1:0,detailJson,order?.nextOrder ?? 0).run();
  } catch (error) {
    if (String(error).toLowerCase().includes('unique')) return NextResponse.json({ error: 'This project URL slug is already in use' }, { status: 409 });
    throw error;
  }
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
export async function PATCH(request: Request) {
  if (!await authorized(request)) return NextResponse.json({ error: 'Unauthorized or invalid request' }, { status: 403, headers: noStoreHeaders() });
  const p = await request.json() as ProjectPayload;
  const existingRecord = await database.prepare('SELECT image_url AS "imageUrl",content_json AS "contentJson",detail_json AS "detailJson" FROM projects WHERE id=?').bind(p.id).first<{ imageUrl: string | null; contentJson: string | null; detailJson: string | null }>();
  if (!existingRecord) return NextResponse.json({ error: 'Project not found' }, { status: 404, headers: noStoreHeaders() });
  let contentJson: string | null; let detailJson: string | null; let destination: ProjectDestination;
  try {
    if (p.contentJson === undefined) {
      contentJson = existingRecord.contentJson;
    } else contentJson = normalizeContent(p.contentJson);
    detailJson = normalizeDetails(p.detailJson);
    destination = normalizeDestination(p);
  }
  catch { return NextResponse.json({ error: 'Invalid project content' }, { status: 400 }); }
  const slug = toProjectSlug(p.slug || p.title);
  if (!slug) return NextResponse.json({ error: 'A valid project title or slug is required' }, { status: 400 });
  try {
    await database.prepare('UPDATE projects SET slug=?,title=?,category=?,summary=?,body=?,content_json=?,tech=?,year=?,image_url=?,project_url=?,github_url=?,featured=?,destination=?,published=?,show_on_projects=?,detail_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(slug,p.title,p.category,p.summary,p.body,contentJson,p.tech,p.year,p.imageUrl||null,p.projectUrl||null,p.githubUrl||null,p.featured?1:0,destination,p.published?1:0,p.showOnProjects?1:0,detailJson,p.id).run();
  } catch (error) {
    if (String(error).toLowerCase().includes('unique')) return NextResponse.json({ error: 'This project URL slug is already in use' }, { status: 409 });
    throw error;
  }
  const retained = managedBlobUrls(p.imageUrl, contentJson, detailJson);
  const removed = [...managedBlobUrls(existingRecord.imageUrl, existingRecord.contentJson, existingRecord.detailJson)].filter((url) => !retained.has(url));
  await deleteManagedBlobsIfUnreferenced(removed);
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
export async function DELETE(request: Request) {
  if (!await authorized(request)) return NextResponse.json({ error: 'Unauthorized or invalid request' }, { status: 403, headers: noStoreHeaders() });
  const { id } = await request.json() as { id: number };
  const existing = await database.prepare('SELECT image_url AS "imageUrl",content_json AS "contentJson",detail_json AS "detailJson" FROM projects WHERE id=?').bind(id).first<{ imageUrl: string | null; contentJson: string | null; detailJson: string | null }>();
  await database.prepare('DELETE FROM projects WHERE id=?').bind(id).run();
  if (existing) await deleteManagedBlobsIfUnreferenced(managedBlobUrls(existing.imageUrl, existing.contentJson, existing.detailJson));
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  if (!await authorized(request)) return NextResponse.json({ error: 'Unauthorized or invalid request' }, { status: 403, headers: noStoreHeaders() });
  const { ids } = await request.json() as { ids?: number[] };
  if (!Array.isArray(ids) || !ids.length || ids.some((id) => !Number.isInteger(id)) || new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: 'Invalid project order' }, { status: 400 });
  }
  const existing = (await database.prepare('SELECT id FROM projects').all<{ id: number }>()).results;
  const existingIds = new Set(existing.map((item) => item.id));
  if (existingIds.size !== ids.length || ids.some((id) => !existingIds.has(id))) {
    return NextResponse.json({ error: 'Project list changed; refresh and try again' }, { status: 409 });
  }
  await database.batch(ids.map((id, index) => database.prepare('UPDATE projects SET display_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(index, id)));
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
