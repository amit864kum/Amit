import { env } from 'cloudflare:workers';
type Props = { params: Promise<{ key: string }> };
export async function GET(_: Request, { params }: Props) {
  const key = decodeURIComponent((await params).key);
  if (!key.startsWith('projects/') && !key.startsWith('content/')) return new Response('Not found', { status: 404 });
  const object = await env.FILES.get(key);
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
}
