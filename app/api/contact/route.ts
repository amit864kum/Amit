import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { sendContactNotification } from '@/lib/contact-email';
import { ensureContentTables } from '@/lib/content';
import {
  looksLikeSpam,
  noStoreHeaders,
  rateLimit,
  sameOriginRequest,
  validSubmissionTiming,
  verifyTurnstile,
} from '@/lib/request-security';

const services = new Set([
  'Full-stack development',
  'Blockchain product',
  'Portfolio or brand website',
  'Technical consulting',
]);
const budgets = new Set(['', 'Under ₹50,000', '₹50,000–₹1,50,000', '₹1,50,000+']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function json(payload: Record<string, unknown>, status = 200, headers?: HeadersInit) {
  return NextResponse.json(payload, { status, headers: noStoreHeaders(headers) });
}

export async function POST(request: Request) {
  try {
    if (!sameOriginRequest(request)) return json({ error: 'The request could not be verified.' }, 403);
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 40_000) return json({ error: 'The enquiry is too large.' }, 413);
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.startsWith('multipart/form-data') && !contentType.startsWith('application/x-www-form-urlencoded')) {
      return json({ error: 'The enquiry format is not supported.' }, 415);
    }
    const throttle = await rateLimit(request, { scope: 'contact', limit: 5, windowSeconds: 15 * 60 });
    if (!throttle.allowed) {
      return json({ error: 'Too many enquiries were submitted. Please try again later.' }, 429, { 'retry-after': String(throttle.retryAfter) });
    }

    const form = await request.formData();
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim().toLowerCase();
    const service = String(form.get('service') || '').trim();
    const budget = String(form.get('budget') || '').trim();
    const message = String(form.get('message') || '').trim();
    const honeypot = String(form.get('website') || '').trim();
    const startedAt = String(form.get('startedAt') || '');
    const turnstileToken = String(form.get('cf-turnstile-response') || '');
    const customService = service.startsWith('Other: ') && service.slice(7).trim().length >= 10 && service.length <= 160;
    const validService = services.has(service) || customService;

    if (honeypot || !validSubmissionTiming(startedAt) || looksLikeSpam([name, email, service, message])) {
      return json({ error: 'The request could not be verified.' }, 400);
    }
    if (
      name.length < 2 || name.length > 80
      || !emailPattern.test(email) || email.length > 120
      || !validService || !budgets.has(budget)
      || message.length < 20 || message.length > 3000
    ) {
      return json({ error: 'Please review the highlighted information and try again.' }, 400);
    }

    const challenge = await verifyTurnstile(turnstileToken, request);
    if (!challenge.success) return json({ error: 'Bot verification failed. Please refresh and try again.' }, 403);

    await ensureContentTables();
    await env.DB.prepare('INSERT INTO contact_messages (name,email,service,budget,message) VALUES (?,?,?,?,?)')
      .bind(name, email, service, budget, message).run();
    const notification = await sendContactNotification({ name, email, service, budget, message });
    return json({ ok: true, notification: notification.delivered ? 'delivered' : 'admin_inbox' });
  } catch {
    return json({ error: 'The enquiry could not be processed. Please try again shortly.' }, 500);
  }
}
