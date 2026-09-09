import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { database } from '@/db';
import { requireAdminApi } from '@/lib/admin';
import { ensureContentTables } from '@/lib/content';
import { hasJsonContentType, noStoreHeaders, sameOriginRequest } from '@/lib/request-security';
import { deleteManagedBlobsIfUnreferenced, managedBlobUrls } from '@/lib/blob-storage';

type ResumePayload = {
  resumeUrl?: string;
  fileName?: string;
  buttonLabel?: string;
};

export async function PUT(request: Request) {
  if (!sameOriginRequest(request)) return NextResponse.json({ error: 'Invalid request' }, { status: 403, headers: noStoreHeaders() });
  if (!hasJsonContentType(request)) return NextResponse.json({ error: 'Invalid request' }, { status: 415, headers: noStoreHeaders() });
  if (!await requireAdminApi()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStoreHeaders() });
  await ensureContentTables();
  const payload = await request.json() as ResumePayload;
  const resumeUrl = payload.resumeUrl?.trim();
  const fileName = payload.fileName?.trim();
  const buttonLabel = payload.buttonLabel?.trim();
  const validResumeUrl = resumeUrl === '/resume-amit-kumar.pdf' || Boolean(resumeUrl && (() => {
    try { return new URL(resumeUrl).hostname.endsWith('.public.blob.vercel-storage.com'); } catch { return false; }
  })());
  if (!validResumeUrl || !fileName || !fileName.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ error: 'Upload a valid PDF resume.' }, { status: 400 });
  }
  if (!buttonLabel || buttonLabel.length > 40) {
    return NextResponse.json({ error: 'Button label must be between 1 and 40 characters.' }, { status: 400 });
  }
  const existing = await database.prepare('SELECT resume_url AS "resumeUrl" FROM resume_settings WHERE id=1').first<{ resumeUrl: string }>();
  await database.prepare(`INSERT INTO resume_settings (id,resume_url,file_name,button_label,updated_at)
    VALUES (1,?,?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET resume_url=excluded.resume_url,file_name=excluded.file_name,
    button_label=excluded.button_label,updated_at=CURRENT_TIMESTAMP`).bind(resumeUrl, fileName, buttonLabel).run();
  if (existing?.resumeUrl !== resumeUrl) await deleteManagedBlobsIfUnreferenced(managedBlobUrls(existing?.resumeUrl));
  revalidatePath('/about', 'page');
  revalidateTag('resume', 'max');
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
}
