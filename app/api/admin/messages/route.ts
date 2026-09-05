import { NextResponse } from 'next/server';
import { database } from '@/db';
import { requireAdminApi } from '@/lib/admin';
import { ensureContentTables } from '@/lib/content';
import { hasJsonContentType, noStoreHeaders, sameOriginRequest } from '@/lib/request-security';

export async function PATCH(request: Request) {
  if (!sameOriginRequest(request)) return NextResponse.json({ error: 'Invalid request' }, { status: 403, headers: noStoreHeaders() });
  if (!hasJsonContentType(request)) return NextResponse.json({ error: 'Invalid request' }, { status: 415, headers: noStoreHeaders() });
  if (!await requireAdminApi()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStoreHeaders() });
  await ensureContentTables();
  const body = await request.json().catch(() => null) as { id?: number; status?: string } | null;
  if (!body?.id || !['new', 'replied', 'archived'].includes(body.status || '')) return NextResponse.json({ error: 'Invalid enquiry update.' }, { status: 400 });
  await database.prepare('UPDATE contact_messages SET status=? WHERE id=?').bind(body.status, body.id).run();
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
}
