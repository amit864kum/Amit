import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { ensureContentTables } from '@/lib/content';

export async function POST(request: Request) {
  await ensureContentTables();
  const form = await request.formData();
  const name = String(form.get('name') || '').trim();
  const email = String(form.get('email') || '').trim();
  const service = String(form.get('service') || '').trim();
  const budget = String(form.get('budget') || '').trim();
  const message = String(form.get('message') || '').trim();
  if (!name || !email.includes('@') || !service || message.length < 20 || message.length > 3000) {
    return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 });
  }
  await env.DB.prepare('INSERT INTO contact_messages (name,email,service,budget,message) VALUES (?,?,?,?,?)').bind(name.slice(0,80), email.slice(0,120), service.slice(0,80), budget.slice(0,80), message).run();
  return NextResponse.json({ ok: true });
}
