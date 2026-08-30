import { NextResponse } from 'next/server';
import { recordAnalyticsEvent, type AnalyticsEventInput } from '@/lib/analytics';

const allowed = new Set(['page_view', 'section_view', 'project_intent', 'contact_intent', 'contact_submitted']);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as AnalyticsEventInput | null;
  if (!body || !allowed.has(body.eventType) || !body.eventKey || !body.visitorId || !body.sessionId || !body.path) {
    return NextResponse.json({ error: 'Invalid analytics event.' }, { status: 400 });
  }
  await recordAnalyticsEvent(body);
  return NextResponse.json({ ok: true });
}
