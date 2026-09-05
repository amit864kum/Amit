# Security audit

**Updated:** 2026-09-06  
**Scope:** Application source, dependencies, Next.js page/API routes, admin authentication and recovery, Neon/Vercel Blob integration, request validation, headers, environment checks, and tracked-secret exposure.

## Current result

The Vercel migration source passes dependency audit, ESLint, TypeScript, the production source checks, and a standard Next.js production build. Full runtime verification remains dependent on provisioning Neon and Vercel Blob and configuring rotated Resend and Turnstile credentials. No production deployment was performed.

| Control | Status | Evidence |
|---|---|---|
| Known dependency vulnerabilities | Pass | `npm audit --audit-level=high`: 0 vulnerabilities |
| Standard Vercel/Next.js build | Pass | `next build` completes; no Vinext/Worker runtime |
| Server-side data store | Pass in source | Neon serverless SQL with Drizzle PostgreSQL schema/migrations |
| Media storage | Pass in source | Authenticated direct-to-Blob upload tokens and post-upload signature validation |
| Admin authentication | Pass in source | PBKDF2 verification, signed HttpOnly cookies, credential-version revocation |
| Password recovery | Pass in source | Generic responses, single-use hashed OTPs, attempt/rate limits, Resend delivery |
| Contact abuse controls | Pass in source | Validation, size limit, honeypot, timing check, Turnstile, atomic rate limit |
| CSRF/origin controls | Pass in source | Same-origin and content-type checks on state-changing endpoints |
| Browser security headers | Pass in source | Nonced CSP, HSTS, MIME sniffing denial, referrer and permissions policies |
| Secret hygiene | Pass in tracked source | Ignored environment files and no detected tracked credential values |
| Live environment and workflow tests | Needs attention | Requires external credentials and a Vercel Preview deployment |

## Important implementation details

- Rate-limit identifiers use Vercel forwarding headers and are HMAC-protected before storage.
- Rate-limit updates use one atomic PostgreSQL upsert, and expired records are cleaned up.
- Public upload credentials are never exposed. The browser receives a short-lived, admin-authorized Blob token for a constrained path, MIME allowlist, and maximum size.
- Uploaded media is fetched server-side and checked for PNG, JPEG, WebP, or PDF signatures before the URL is accepted. Invalid objects are deleted.
- Vercel Function request-body limits are avoided by direct Blob uploads, including multipart upload for larger files.
- Database/storage modules are server-only and secrets are accessed through `process.env`.
- Old analytics and consent tables are intentionally excluded from PostgreSQL.
- Historical OTP and transient rate-limit rows are preserved in the local backup but intentionally excluded from import.

## External release blockers

1. Provision Neon and apply `drizzle-postgres` migrations.
2. Provision a public Vercel Blob store.
3. Rotate and configure any Resend or Turnstile secret previously exposed outside a password manager.
4. Import and verify the versioned D1/R2 export.
5. Run contact, password recovery, admin CRUD, upload, responsive, accessibility, and header checks on Vercel Preview.

These are configuration/verification blockers, not remaining Cloudflare architecture dependencies.
