import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error('Contact schema check: DATABASE_URL is not configured.');
  process.exit(1);
}

try {
  const sql = neon(url);
  await sql.query('SELECT name,email,contact_details,service,budget,message FROM contact_messages LIMIT 0');
  await sql.query('SELECT key,window_start,count,updated_at FROM rate_limits LIMIT 0');
  console.log('Contact and rate-limit schemas are ready.');
} catch (error) {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'unknown';
  console.error(`Contact schema check failed (${code}). Confirm Vercel DATABASE_URL points to the migrated Neon database.`);
  process.exit(1);
}
