import { config } from '@/lib/env';

type Enquiry = { name: string; email: string; contactDetails: string };

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] || character);
}

export async function sendContactNotification(enquiry: Enquiry) {
  const apiKey = config('RESEND_API_KEY');
  const from = config('RESEND_FROM_EMAIL');
  const to = config('ADMIN_EMAIL');
  if (!apiKey || !from || !to) return { configured: false, delivered: false };
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        'idempotency-key': crypto.randomUUID(),
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: enquiry.email,
        subject: `New portfolio enquiry from ${enquiry.name}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;padding:32px"><p style="color:#6b7280">AMIT KUMAR PORTFOLIO</p><h1>New enquiry</h1><p><strong>Name:</strong> ${escapeHtml(enquiry.name)}</p><p><strong>Email:</strong> ${escapeHtml(enquiry.email)}</p><hr><p><strong>Contact details</strong></p><p style="white-space:pre-wrap">${escapeHtml(enquiry.contactDetails)}</p></div>`,
      }),
      signal: AbortSignal.timeout(7000),
    });
    return { configured: true, delivered: response.ok };
  } catch {
    return { configured: true, delivered: false };
  }
}
