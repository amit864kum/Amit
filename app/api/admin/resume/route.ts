import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin';
import { ensureContentTables } from '@/lib/content';

type ResumePayload = {
  resumeUrl?: string;
  fileName?: string;
  buttonLabel?: string;
};

export async function PUT(request: Request) {
  if (!await requireAdminApi()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await ensureContentTables();
  const payload = await request.json() as ResumePayload;
  const resumeUrl = payload.resumeUrl?.trim();
  const fileName = payload.fileName?.trim();
  const buttonLabel = payload.buttonLabel?.trim();
  const validResumeUrl = resumeUrl === '/resume-amit-kumar.pdf' || resumeUrl?.startsWith('/api/media/resumes%2F');
  if (!validResumeUrl || !fileName || !fileName.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ error: 'Upload a valid PDF resume.' }, { status: 400 });
  }
  if (!buttonLabel || buttonLabel.length > 40) {
    return NextResponse.json({ error: 'Button label must be between 1 and 40 characters.' }, { status: 400 });
  }
  await env.DB.prepare(`INSERT INTO resume_settings (id,resume_url,file_name,button_label,updated_at)
    VALUES (1,?,?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET resume_url=excluded.resume_url,file_name=excluded.file_name,
    button_label=excluded.button_label,updated_at=CURRENT_TIMESTAMP`).bind(resumeUrl, fileName, buttonLabel).run();
  return NextResponse.json({ ok: true });
}
