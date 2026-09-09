import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'proxy.ts', 'app/robots.ts', 'app/sitemap.ts', 'app/manifest.ts', 'app/not-found.tsx',
  'lib/request-security.ts', 'components/StructuredData.tsx',
  'scripts/export-cloudflare-data.mjs', 'scripts/import-vercel-data.mjs', 'postcss.config.mjs',
  'vercel.json',
];
const failures = [];
for (const file of requiredFiles) if (!existsSync(resolve(root, file))) failures.push(`Missing ${file}`);
const migrationDirectory = resolve(root, 'drizzle-postgres');
if (!existsSync(migrationDirectory) || !readdirSync(migrationDirectory).some((file) => file.endsWith('.sql'))) {
  failures.push('No PostgreSQL migration was generated');
}

const read = (file) => readFileSync(resolve(root, file), 'utf8');
const proxy = read('proxy.ts');
for (const header of ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy']) {
  if (!proxy.includes(header)) failures.push(`Security header not configured: ${header}`);
}
if (/script-src[^\n]*unsafe-inline/.test(proxy)) failures.push('CSP still permits unsafe inline scripts');
if (!proxy.includes("'nonce-${nonce}'")) failures.push('CSP script nonce is missing');
const layout = read('app/layout.tsx');
for (const marker of ['metadataBase', 'openGraph', 'twitter', 'verification', 'robots']) {
  if (!layout.includes(marker)) failures.push(`Root metadata is missing ${marker}`);
}
const project = read('app/projects/[slug]/page.tsx');
const article = read('app/blog/[slug]/page.tsx');
if (!project.includes("'@type': 'CreativeWork'")) failures.push('Project structured data is missing');
if (!article.includes("'@type': 'Article'")) failures.push('Article structured data is missing');
if (!article.includes('alternates: { canonical:')) failures.push('Article canonical URL is missing');
const contact = read('app/api/contact/route.ts');
for (const marker of ['rateLimit', 'verifyTurnstile', 'sameOriginRequest', 'validSubmissionTiming']) {
  if (!contact.includes(marker)) failures.push(`Contact protection is missing ${marker}`);
}
const protectedMutations = [
  'app/api/admin/logout/route.ts', 'app/api/admin/messages/route.ts', 'app/api/admin/posts/route.ts',
  'app/api/admin/projects/route.ts', 'app/api/admin/resume/route.ts', 'app/api/admin/upload/route.ts',
  'app/api/admin/upload/validate/route.ts',
];
for (const file of protectedMutations) {
  if (!read(file).includes('sameOriginRequest')) failures.push(`Admin mutation lacks same-origin validation: ${file}`);
}
for (const file of ['app/api/admin/login/route.ts', 'app/api/admin/password/forgot/route.ts', 'app/api/admin/password/reset/route.ts', 'app/api/admin/messages/route.ts', 'app/api/admin/posts/route.ts', 'app/api/admin/projects/route.ts', 'app/api/admin/resume/route.ts', 'app/api/admin/upload/route.ts', 'app/api/admin/upload/validate/route.ts']) {
  if (!read(file).includes('hasJsonContentType')) failures.push(`JSON endpoint lacks content-type enforcement: ${file}`);
}
if (read('lib/request-security.ts').includes("request.headers.get('user-agent')")) failures.push('Rate-limit key still trusts User-Agent');
if (read('app/api/admin/password/forgot/route.ts').includes('previewCode')) failures.push('Password recovery still exposes preview codes');
if (!read('app/api/admin/upload/validate/route.ts').includes('matchesSignature')) failures.push('Upload content signatures are not verified');
if (!read('lib/security-crypto.ts').includes('const iterations = 600_000')) failures.push('Password hashing work factor was not upgraded');
const packageJson = JSON.parse(read('package.json'));
if (packageJson.scripts?.build !== 'next build' || packageJson.scripts?.start !== 'next start') failures.push('Standard Next.js scripts are not configured');
const vercelConfig = JSON.parse(read('vercel.json'));
if (vercelConfig.buildCommand !== 'npm run vercel-build') failures.push('Vercel is not configured to run the migration-aware build');
for (const dependency of ['vinext', 'vite', 'wrangler', '@cloudflare/vite-plugin', '@cloudflare/workers-types']) {
  if (packageJson.dependencies?.[dependency] || packageJson.devDependencies?.[dependency]) failures.push(`Cloudflare/Vinext dependency remains: ${dependency}`);
}
const sourceFiles = ['db/index.ts', 'lib/env.ts', 'lib/content.ts', 'lib/admin-data.ts', 'lib/admin-security.ts', 'lib/request-security.ts'];
for (const file of sourceFiles) if (read(file).includes('cloudflare:workers')) failures.push(`Cloudflare runtime import remains: ${file}`);
if (failures.length) {
  console.error(`Production checks failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log('Production source checks passed.');
