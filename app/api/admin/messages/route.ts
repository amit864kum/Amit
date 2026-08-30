import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin';
import { ensureContentTables } from '@/lib/content';

export async function PATCH(request: Request) {
  if (!await requireAdminApi()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await ensureContentTables();
  const body = await request.json().catch(() => null) as { id?: number; status?: string } | null;
  if (!body?.id || !['new', 'replied', 'archived'].includes(body.status || '')) return NextResponse.json({ error: 'Invalid enquiry update.' }, { status: 400 });
  await env.DB.prepare('UPDATE contact_messages SET status=? WHERE id=?').bind(body.status, body.id).run();
  return NextResponse.json({ ok: true });
}
