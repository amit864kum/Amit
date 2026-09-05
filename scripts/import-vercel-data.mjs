import { neon } from '@neondatabase/serverless';
import { put } from '@vercel/blob';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';

const exportRoot = resolve(process.argv[2] || '');
const manifestPath = resolve(exportRoot, 'manifest.json');
if (!process.argv[2] || !existsSync(manifestPath)) throw new Error('Usage: npm run migrate:import -- <export-directory>');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('BLOB_READ_WRITE_TOKEN is required.');

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (manifest.version !== 1) throw new Error('Unsupported migration manifest version.');
const sql = neon(process.env.DATABASE_URL);
const mediaUrls = new Map();

for (const media of manifest.media || []) {
  const path = resolve(exportRoot, media.file);
  if (!path.startsWith(exportRoot + sep) || !existsSync(path)) throw new Error(`Missing or unsafe media file: ${media.file}`);
  const blob = await put(media.key, readFileSync(path), {
    access: 'public',
    contentType: media.contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  mediaUrls.set(media.key, blob.url);
}

function migrateMediaReferences(value) {
  if (typeof value !== 'string') return value;
  let migrated = value;
  for (const [key, url] of mediaUrls) {
    migrated = migrated.replaceAll(`/api/media/${encodeURIComponent(key)}`, url).replaceAll(`/api/media/${key}`, url);
  }
  return migrated;
}

const definitions = {
  projects: ['id','slug','title','category','summary','body','content_json','tech','year','image_url','project_url','github_url','featured','destination','published','show_on_projects','detail_json','display_order','created_at','updated_at'],
  posts: ['id','slug','title','excerpt','body','content_json','category','image_url','featured','published_at','published','created_at','updated_at'],
  contact_messages: ['id','name','email','contact_details','service','budget','message','status','created_at'],
  resume_settings: ['id','resume_url','file_name','button_label','updated_at'],
  admin_security: ['username','password_hash','updated_at'],
};

for (const [table, columns] of Object.entries(definitions)) {
  const rows = manifest.tables?.[table] || [];
  for (const raw of rows) {
    const values = columns.map((column) => migrateMediaReferences(raw[column] ?? null));
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(',');
    const updates = columns.filter((column) => column !== 'id' && column !== 'username')
      .map((column) => `${column}=EXCLUDED.${column}`).join(',');
    const conflict = table === 'admin_security' ? 'username' : 'id';
    await sql.query(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${placeholders}) ON CONFLICT (${conflict}) DO UPDATE SET ${updates}`, values);
  }
  console.log(`${table}: imported ${rows.length}`);
}

for (const table of ['projects', 'posts', 'contact_messages']) {
  await sql.query(`SELECT setval(pg_get_serial_sequence('${table}','id'), COALESCE((SELECT MAX(id) FROM ${table}), 1), COALESCE((SELECT MAX(id) FROM ${table}), 0) > 0)`);
}
console.log(`media: uploaded ${mediaUrls.size}`);
console.log('Vercel data migration complete.');
