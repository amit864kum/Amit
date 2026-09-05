import { hashPassword, hmacValue, passwordPolicy, timingSafeEqual } from '@/lib/security-crypto';
import { database } from '@/db';
import { config } from '@/lib/env';

export function ensureAdminSecurityTables() {
  return Promise.resolve();
}

export async function getAdminPasswordHash(username: string) {
  await ensureAdminSecurityTables();
  const row = await database.prepare('SELECT password_hash AS "passwordHash" FROM admin_security WHERE username=?').bind(username).first<{ passwordHash: string }>();
  return row?.passwordHash || config('ADMIN_PASSWORD_HASH');
}

export async function setAdminPasswordHash(username: string, passwordHash: string) {
  await ensureAdminSecurityTables();
  await database.prepare(`INSERT INTO admin_security (username,password_hash,updated_at) VALUES (?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(username) DO UPDATE SET password_hash=excluded.password_hash,updated_at=CURRENT_TIMESTAMP`)
    .bind(username, passwordHash).run();
}

function generateCode() {
  const values = crypto.getRandomValues(new Uint32Array(1));
  return String(values[0] % 1_000_000).padStart(6, '0');
}

async function codeHash(username: string, code: string) {
  return hmacValue(config('ADMIN_SESSION_SECRET'), `${username}:${code}`);
}

async function sendResetEmail(email: string, code: string) {
  const apiKey = config('RESEND_API_KEY');
  if (!apiKey) return { delivered: false };
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json', 'idempotency-key': crypto.randomUUID() },
      body: JSON.stringify({
        from: config('RESEND_FROM_EMAIL') || 'Amit Portfolio <onboarding@resend.dev>',
        to: [email],
        subject: 'Your Amit Portfolio admin verification code',
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px"><p style="color:#6b7280">AMIT PORTFOLIO ADMIN</p><h1 style="font-size:28px">Reset your password</h1><p>Use this one-time code to continue:</p><p style="font-size:36px;letter-spacing:8px;font-weight:700">${code}</p><p>This code expires in 10 minutes. If you did not request it, no action is required.</p></div>`,
      }),
      signal: AbortSignal.timeout(8_000),
    });
    return { delivered: response.ok };
  } catch {
    return { delivered: false };
  }
}

export async function requestAdminReset() {
  await ensureAdminSecurityTables();
  const username = config('ADMIN_USERNAME');
  const email = config('ADMIN_EMAIL') || 'amitkumarabhinav59@gmail.com';
  const recent = await database.prepare("SELECT COUNT(*)::int AS count FROM password_reset_codes WHERE username=? AND requested_at >= NOW() - INTERVAL '15 minutes'").bind(username).first<{ count: number }>();
  if (Number(recent?.count || 0) >= 3) return { accepted: true, destination: 'the protected admin email', delivered: false };
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();
  await database.batch([
    database.prepare('UPDATE password_reset_codes SET consumed_at=CURRENT_TIMESTAMP WHERE username=? AND consumed_at IS NULL').bind(username),
    database.prepare('INSERT INTO password_reset_codes (username,email,code_hash,expires_at,requested_at) VALUES (?,?,?,?,?)').bind(username, email, await codeHash(username, code), expiresAt, new Date().toISOString()),
  ]);
  const delivery = await sendResetEmail(email, code);
  return { accepted: true, destination: 'the protected admin email', delivered: delivery.delivered };
}

export async function resetAdminPassword(code: string, password: string) {
  await ensureAdminSecurityTables();
  const policyError = passwordPolicy(password);
  if (policyError) return { ok: false, error: policyError };
  const username = config('ADMIN_USERNAME');
  const row = await database.prepare(`SELECT id,code_hash AS "codeHash",expires_at AS "expiresAt",attempts FROM password_reset_codes
    WHERE username=? AND consumed_at IS NULL ORDER BY requested_at DESC LIMIT 1`).bind(username).first<{ id: number; codeHash: string; expiresAt: string; attempts: number }>();
  if (!row || row.attempts >= 5 || new Date(row.expiresAt).getTime() < Date.now()) return { ok: false, error: 'The code is invalid or has expired.' };
  const expected = await codeHash(username, code.trim());
  const valid = timingSafeEqual(new TextEncoder().encode(expected), new TextEncoder().encode(row.codeHash));
  if (!valid) {
    await database.prepare('UPDATE password_reset_codes SET attempts=attempts+1 WHERE id=?').bind(row.id).run();
    return { ok: false, error: 'The code is invalid or has expired.' };
  }
  const newHash = await hashPassword(password);
  await database.batch([
    database.prepare(`INSERT INTO admin_security (username,password_hash,updated_at) VALUES (?,?,CURRENT_TIMESTAMP)
      ON CONFLICT(username) DO UPDATE SET password_hash=excluded.password_hash,updated_at=CURRENT_TIMESTAMP`).bind(username, newHash),
    database.prepare('UPDATE password_reset_codes SET consumed_at=CURRENT_TIMESTAMP WHERE username=? AND consumed_at IS NULL').bind(username),
  ]);
  return { ok: true };
}
