import { NextResponse } from 'next/server';
import { database, databaseConfigured } from '@/db';
import { sendContactNotification } from '@/lib/contact-email';
import { ensureContentTables } from '@/lib/content';
import {
  looksLikeSpam,
  noStoreHeaders,
  rateLimit,
  sameOriginRequest,
  verifyTurnstile,
} from '@/lib/request-security';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const phonePattern = /^[+()0-9\s-]{7,24}$/;

function json(payload: Record<string, unknown>, status = 200, headers?: HeadersInit) {
  return NextResponse.json(payload, { status, headers: noStoreHeaders(headers) });
}

export async function POST(request: Request) {
  let stage = 'request';
  try {
    if (!sameOriginRequest(request)) {
      console.warn('Contact enquiry rejected', { reason: 'origin' });
      return json({ error: 'This form session could not be verified. Refresh the page and try again.' }, 403);
    }
    if (!databaseConfigured()) {
      return json({
        error: process.env.NODE_ENV === 'production'
          ? 'The enquiry service is temporarily unavailable. Please email Amit directly.'
          : 'The local enquiry service needs DATABASE_URL in .env.local. Connect Neon and restart the development server.',
      }, 503);
    }
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 40_000) return json({ error: 'The enquiry is too large.' }, 413);
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.startsWith('multipart/form-data') && !contentType.startsWith('application/x-www-form-urlencoded')) {
      return json({ error: 'The enquiry format is not supported.' }, 415);
    }
    stage = 'rate_limit';
    const throttle = await rateLimit(request, { scope: 'contact', limit: 5, windowSeconds: 15 * 60 });
    if (!throttle.allowed) {
      return json({ error: 'Too many enquiries were submitted. Please try again later.' }, 429, { 'retry-after': String(throttle.retryAfter) });
    }

    stage = 'validation';
    const form = await request.formData();
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim().toLowerCase();
    // Accept the previous field name while any cached clients are still open.
    const contactNumber = String(form.get('contactNumber') || form.get('contactDetails') || '').trim();
    const turnstileToken = String(form.get('cf-turnstile-response') || '');

    if (looksLikeSpam([name, email, contactNumber])) {
      console.warn('Contact enquiry rejected', { reason: 'spam_pattern' });
      return json({ error: 'The enquiry could not be verified. Please email Amit directly if this continues.' }, 400);
    }
    if (
      name.length < 2 || name.length > 80
      || !emailPattern.test(email) || email.length > 120
      || !phonePattern.test(contactNumber)
      || (contactNumber.match(/\d/g)?.length || 0) < 7
      || (contactNumber.match(/\d/g)?.length || 0) > 15
    ) {
      return json({ error: 'Please review the highlighted information and try again.' }, 400);
    }

    stage = 'bot_verification';
    const challenge = await verifyTurnstile(turnstileToken, request);
    if (!challenge.success) return json({ error: 'Bot verification failed. Please refresh and try again.' }, 403);

    stage = 'storage';
    await ensureContentTables();
    await database.prepare('INSERT INTO contact_messages (name,email,contact_details,service,budget,message) VALUES (?,?,?,?,?,?)')
      .bind(name, email, contactNumber, 'Direct enquiry', '', contactNumber).run();
    stage = 'notification';
    const notification = await sendContactNotification({ name, email, contactDetails: contactNumber });
    return json({ ok: true, notification: notification.delivered ? 'delivered' : 'admin_inbox' });
  } catch (error) {
    // Log the failing stage and database error code, never personal form values.
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'unknown';
    console.error('Contact enquiry failed', { stage, code });
    return json({ error: 'The enquiry could not be processed. Please email Amit directly if the problem continues.' }, 500);
  }
}
