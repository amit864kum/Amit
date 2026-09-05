import 'server-only';
import { del } from '@vercel/blob';
import { database } from '@/db';

function isManagedBlobUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch { return false; }
}

export function managedBlobUrls(...values: Array<string | null | undefined>) {
  const urls = new Set<string>();
  for (const value of values) {
    if (!value) continue;
    if (isManagedBlobUrl(value)) urls.add(value);
    for (const match of value.matchAll(/https:\/\/[a-z0-9.-]+\.public\.blob\.vercel-storage\.com\/[^\s"'\\)]+/gi)) {
      if (isManagedBlobUrl(match[0])) urls.add(match[0]);
    }
  }
  return urls;
}

export async function deleteManagedBlobsIfUnreferenced(urls: Iterable<string>) {
  for (const url of urls) {
    if (!isManagedBlobUrl(url)) continue;
    const row = await database.prepare(`SELECT (
      EXISTS (SELECT 1 FROM projects WHERE image_url=? OR POSITION(? IN COALESCE(content_json,'')) > 0 OR POSITION(? IN COALESCE(detail_json,'')) > 0)
      OR EXISTS (SELECT 1 FROM posts WHERE image_url=? OR POSITION(? IN COALESCE(content_json,'')) > 0)
      OR EXISTS (SELECT 1 FROM resume_settings WHERE resume_url=?)
    ) AS referenced`).bind(url, url, url, url, url, url).first<{ referenced: boolean }>();
    if (!row?.referenced) await del(url).catch(() => undefined);
  }
}
