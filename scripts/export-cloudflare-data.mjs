import { DatabaseSync } from 'node:sqlite';
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, resolve, sep } from 'node:path';

const stateRoot = resolve(process.argv[2] || '.wrangler/state/v3');
const stamp = new Date().toISOString().replaceAll(':', '').replaceAll('.', '-');
const outputRoot = resolve(process.argv[3] || `.migration-backup/export-${stamp}`);
const tables = ['projects', 'posts', 'contact_messages', 'resume_settings', 'admin_security', 'password_reset_codes'];

function filesBelow(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });
}

function hasTable(path, table) {
  try {
    const db = new DatabaseSync(path, { readOnly: true });
    const row = db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(table);
    db.close();
    return Boolean(row);
  } catch { return false; }
}

const d1File = filesBelow(join(stateRoot, 'd1'))
  .filter((path) => path.endsWith('.sqlite') && basename(path) !== 'metadata.sqlite')
  .find((path) => hasTable(path, 'projects'));
if (!d1File) throw new Error(`No local D1 portfolio database was found below ${stateRoot}.`);

mkdirSync(outputRoot, { recursive: true });
const source = new DatabaseSync(d1File, { readOnly: true });
const data = {};
for (const table of tables) {
  if (source.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(table)) {
    data[table] = source.prepare(`SELECT * FROM ${table}`).all();
  } else data[table] = [];
}
source.close();

const r2Databases = filesBelow(join(stateRoot, 'r2')).filter((path) => path.endsWith('.sqlite') && hasTable(path, '_mf_objects'));
const allR2Files = filesBelow(join(stateRoot, 'r2'));
const media = [];
for (const r2Database of r2Databases) {
  const db = new DatabaseSync(r2Database, { readOnly: true });
  const objects = db.prepare('SELECT key,blob_id,size,http_metadata FROM _mf_objects').all();
  db.close();
  for (const object of objects) {
    const sourcePath = allR2Files.find((path) => basename(path) === object.blob_id);
    if (!sourcePath || !['content/', 'projects/', 'resumes/'].some((prefix) => object.key.startsWith(prefix))) continue;
    const destination = resolve(outputRoot, 'media', object.key);
    if (!destination.startsWith(resolve(outputRoot, 'media') + sep)) throw new Error(`Unsafe R2 key: ${object.key}`);
    mkdirSync(resolve(destination, '..'), { recursive: true });
    cpSync(sourcePath, destination);
    const metadata = JSON.parse(object.http_metadata || '{}');
    media.push({ key: object.key, file: `media/${object.key}`, size: statSync(sourcePath).size, contentType: metadata.contentType || 'application/octet-stream' });
  }
}

const manifest = { version: 1, exportedAt: new Date().toISOString(), sourceDatabase: d1File, tables: data, media };
writeFileSync(join(outputRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Cloudflare export created at ${outputRoot}`);
for (const table of tables) console.log(`${table}: ${data[table].length}`);
console.log(`media: ${media.length}`);
