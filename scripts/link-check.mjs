const origin = new URL(process.argv[2] || 'http://localhost:3000');
const queue = ['/', '/about', '/projects', '/contact', '/blog'];
const checked = new Map();
const failures = [];

while (queue.length && checked.size < 100) {
  const path = queue.shift();
  if (!path || checked.has(path)) continue;

  try {
    const response = await fetch(new URL(path, origin), {
      redirect: 'follow',
      signal: AbortSignal.timeout(30_000),
    });
    checked.set(path, response.status);
    if (!response.ok) {
      failures.push(`${path} returned ${response.status}`);
      continue;
    }

    if (!response.headers.get('content-type')?.includes('text/html')) continue;
    const html = await response.text();
    for (const match of html.matchAll(/href=["']([^"']+)["']/gi)) {
      const href = match[1];
      if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(href)) continue;
      const target = new URL(href, origin);
      if (target.origin !== origin.origin) continue;
      const normalized = `${target.pathname}${target.search}`;
      if (normalized.startsWith('/api/') || normalized.startsWith('/admin') || normalized.startsWith('/_next/')) continue;
      if (!checked.has(normalized) && !queue.includes(normalized)) queue.push(normalized);
    }
  } catch (error) {
    failures.push(`${path} failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures.length) {
  console.error(`Internal link check failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Internal link check passed (${checked.size} routes).`);
