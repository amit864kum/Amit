import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envFiles = ['.env', '.env.local', '.env.production.local'].filter((file) => existsSync(resolve(process.cwd(), file)));
const values = new Map();
for (const file of envFiles) {
  for (const line of readFileSync(resolve(process.cwd(), file), 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (match && match[2].trim().replace(/^['"]|['"]$/g, '')) values.set(match[1], true);
  }
}
const required = ['SITE_URL', 'DATABASE_URL', 'BLOB_READ_WRITE_TOKEN', 'ADMIN_USERNAME', 'ADMIN_PASSWORD_HASH', 'ADMIN_SESSION_SECRET', 'ADMIN_EMAIL', 'RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY'];
const missing = required.filter((name) => !values.get(name) && !process.env[name]);
const siteUrl = process.env.SITE_URL || (() => {
  for (const file of envFiles) {
    const match = readFileSync(resolve(process.cwd(), file), 'utf8').match(/^\s*SITE_URL\s*=\s*(.+)$/m);
    if (match) return match[1].trim().replace(/^['"]|['"]$/g, '');
  }
  return '';
})();
if (siteUrl && !siteUrl.startsWith('https://')) missing.push('SITE_URL must use HTTPS');
if (missing.length) {
  console.error(`Production environment is incomplete:\n- ${missing.join('\n- ')}`);
  process.exit(1);
}
console.log('Production environment configuration is complete.');
