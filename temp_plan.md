# Vercel Migration Plan

Last updated: 2026-09-03

## Objective

Migrate the complete portfolio from the Cloudflare-specific Vinext/Workers/D1/R2 architecture to a production-ready Vercel architecture while preserving the existing premium UI, content, URLs, admin functionality, security controls, email flow, uploads, and SEO.

## Target architecture

```text
Browser
  -> Vercel CDN
  -> Standard Next.js App Router application
       -> Server Components and Route Handlers
       -> Neon PostgreSQL through Drizzle ORM
       -> Vercel Blob for public portfolio media
       -> Resend for enquiries and password-reset OTP
       -> Cloudflare Turnstile over HTTPS for bot verification
```

One Vercel project will host both the frontend and backend at `https://amit-three.vercel.app`. Cloudflare D1, R2, Workers, Wrangler, Vinext, and Sites hosting bindings will no longer be runtime dependencies.

## Status legend

- `[x]` Complete
- `[-]` In progress
- `[ ]` Not started
- `[!]` Needs user credential or external service
- `[B]` Blocked

## Overall status

| Area | Status | Notes |
|---|---|---|
| Migration plan | Complete | This file is the implementation tracker. |
| Source migration | Not started | No architecture-changing source edits made yet. |
| Data migration | Not started | Existing D1 data must be backed up first. |
| Vercel resources | Needs user action | Neon and Vercel Blob must be provisioned. |
| Verification | Not started | Standard Next.js build and full QA required. |
| Deployment | Not authorized | Do not deploy until the user explicitly requests it. |

## Phase 0 — Safety and baseline

- [ ] Record the current Git status and preserve unrelated user changes.
- [ ] Run the existing audit, lint, build, and production checks as a baseline.
- [ ] Back up the local D1 database and existing migrations.
- [ ] Inventory all project, blog, enquiry, admin, resume, and media records.
- [ ] Inventory any existing R2/local uploaded media.
- [ ] Inventory every Cloudflare binding, Worker import, generated declaration, and platform-specific build file.
- [ ] Record current route behaviour, record counts, and representative dynamic URLs for post-migration comparison.
- [ ] Confirm `.env.example` contains placeholders only.
- [ ] Confirm `.dev.vars` and all real credentials remain ignored by Git.
- [!] Rotate the exposed Resend API key.
- [!] Rotate the exposed Turnstile secret key.

Exit condition: a recoverable backup and baseline report exist before removing Cloudflare code.

## Phase 1 — Standard Next.js runtime

- [ ] Replace Vinext scripts with `next dev`, `next build`, and `next start`.
- [ ] Review and update the existing `next.config.ts` for standard Next.js, Blob image hosts, security, and Vercel behaviour.
- [ ] Add `postcss.config.mjs` so the existing Tailwind CSS 4 import continues to compile without Vite.
- [ ] Remove Vinext, Vite, Wrangler, Cloudflare Vite, Workers types, and Sites Vite dependencies.
- [ ] Remove `vite.config.ts` and the Worker production-preview helper.
- [ ] Remove every `cloudflare:workers` import.
- [ ] Remove Cloudflare types from `tsconfig.json`.
- [ ] Replace or remove Cloudflare declarations in `env.d.ts` and `db/env.d.ts`.
- [ ] Replace runtime binding access with a validated server-only `process.env` configuration module.
- [ ] Mark environment and database modules as server-only so secrets cannot enter client bundles.
- [ ] Use the Node.js runtime for database, crypto, email, and upload handlers where required.
- [ ] Keep `NEXT_PUBLIC_*` values limited to genuinely public browser configuration.
- [ ] Preserve the existing App Router pages, components, CSS, fonts, motion, and visual design.

Exit condition: the application compiles far enough under standard Next.js to expose the remaining database/storage migration errors clearly.

## Phase 2 — PostgreSQL and Drizzle migration

- [ ] Provision or connect a Neon PostgreSQL database through Vercel Marketplace.
- [ ] Add the Neon serverless driver and PostgreSQL Drizzle configuration.
- [ ] Update `drizzle.config.ts` from SQLite to PostgreSQL and source its URL securely.
- [ ] Convert the SQLite/D1 schema to PostgreSQL types and constraints.
- [ ] Convert projects, posts, enquiries, resume settings, admin security, password resets, and rate limits.
- [ ] Replace all `env.DB.prepare`, `batch`, `first`, and `all` calls.
- [ ] Replace SQLite-specific SQL with parameterized PostgreSQL queries.
- [ ] Preserve display ordering, publication state, slugs, JSON content blocks, timestamps, and optional images.
- [ ] Convert integer booleans and serialized JSON safely to PostgreSQL boolean/JSONB-compatible values.
- [ ] Exclude the removed analytics and consent tables from the new schema and data import.
- [ ] Add indexes for slugs, publication state, display order, reset lookups, and rate-limit windows.
- [ ] Generate and inspect PostgreSQL migrations.
- [ ] Create an idempotent seed/import path for initial portfolio content.

Exit condition: all public and admin data access runs through Neon-compatible Drizzle code.

## Phase 3 — Existing data transfer

- [ ] Create a read-only D1 export utility.
- [ ] Export every table to a versioned local backup outside public assets.
- [ ] Create a Neon import utility with transactions and duplicate protection.
- [ ] Import projects, posts, enquiries, resume settings, and admin security data.
- [ ] Import active password reset/rate-limit data only if still valid; otherwise begin with clean ephemeral security records.
- [ ] Reset PostgreSQL identity sequences after preserving imported numeric IDs.
- [ ] Compare source and destination record counts.
- [ ] Validate representative project and blog records field by field.
- [ ] Preserve current slugs so existing URLs do not break.

Exit condition: Neon contains a verified copy of all required D1 data.

## Phase 4 — Vercel Blob migration

- [ ] Create a public Vercel Blob store for portfolio media.
- [ ] Add `@vercel/blob` and configure `BLOB_READ_WRITE_TOKEN`.
- [ ] Rewrite the authenticated admin upload route.
- [ ] Enforce file-size, MIME-type, extension, filename, and authorization validation.
- [ ] Use collision-resistant paths and safe cache headers.
- [ ] Store returned Blob URLs in PostgreSQL.
- [ ] Update project, blog, resume, and media rendering.
- [ ] Configure `next/image` remote patterns for the Blob hostname.
- [ ] Transfer any existing uploaded media and rewrite old URLs.
- [ ] Delete replaced/deleted Blobs safely to prevent orphaned storage without deleting shared assets.
- [ ] Remove R2 `FILES` binding access and obsolete media proxy code.

Exit condition: uploads, reads, optional images, and resume files work without R2.

## Phase 5 — API and authentication adaptation

- [ ] Convert every API endpoint to a standard Next.js Route Handler.
- [ ] Preserve admin login, logout, enquiries, projects, posts, resume, uploads, forgot-password, and reset-password APIs.
- [ ] Preserve PBKDF2 password verification and timing-safe comparisons.
- [ ] Preserve signed `HttpOnly`, `Secure`, and `SameSite=Strict` session cookies.
- [ ] Store reset password overrides and OTP state in PostgreSQL.
- [ ] Keep generic authentication errors and no-store private responses.
- [ ] Validate same-origin and CSRF-sensitive requests against `SITE_URL`.
- [ ] Trust only Vercel-provided forwarding headers when deriving client IPs and origins.
- [ ] Ensure protected admin pages redirect safely without open redirects.
- [ ] Add explicit cache/revalidation behaviour after project, blog, resume, and media mutations so public pages update immediately.
- [ ] Confirm dynamic public pages are rendered at request time or revalidated intentionally rather than frozen at build time.

Exit condition: every admin and public API works in the Vercel Node.js runtime.

## Phase 6 — Abuse protection and email

- [ ] Port the rate limiter from D1 to an atomic PostgreSQL implementation.
- [ ] Retain separate limits for login, OTP, reset, contact, and upload actions.
- [ ] Keep Turnstile client rendering and server-side Siteverify validation.
- [!] Register `amit-three.vercel.app` in the Turnstile widget after rotating its secret.
- [ ] Define a safe Turnstile strategy for changing Vercel Preview hostnames, using approved Preview hostnames or Cloudflare test keys outside production.
- [ ] Retain Resend enquiry notifications and reset OTP delivery.
- [!] Configure and verify the production Resend sender.
- [ ] Add request timeouts, idempotency, sanitized logs, and secure failure responses.
- [ ] Update CSP `connect-src`, `img-src`, and `frame-src` for Vercel Blob, Resend server calls, and Turnstile without broadening browser permissions unnecessarily.

Exit condition: contact, authentication, and upload endpoints resist common spam and brute-force abuse.

## Phase 7 — SEO and content integrity

- [ ] Preserve unique metadata and canonical URLs for every public page.
- [ ] Preserve project and blog dynamic metadata.
- [ ] Preserve Open Graph, Twitter cards, Person/ProfilePage JSON-LD, robots, sitemap, and manifest.
- [ ] Set canonical production origin to `https://amit-three.vercel.app`.
- [ ] Verify descriptive image alt text and heading hierarchy.
- [ ] Ensure sitemap records come from PostgreSQL.
- [ ] Ensure deleted or unpublished records return correct 404 responses.
- [ ] Verify legacy `/work/*` and current `/projects/*` routes retain their intended redirect/canonical behaviour.
- [ ] Complete Search Console verification and submit the production sitemap only after the final Vercel URL is live.
- [ ] Keep existing SEO copy natural and avoid keyword stuffing.

Exit condition: migration produces no SEO regression or broken indexed URL.

## Phase 8 — Vercel configuration

- [ ] Remove `.openai/hosting.json` only after Cloudflare dependencies are fully eliminated.
- [ ] Add `vercel.json` only if required for headers or explicit platform behaviour.
- [ ] Add `.vercelignore` if needed to exclude local backups, Cloudflare state, generated Worker output, and migration exports.
- [ ] Configure production security headers for the Vercel runtime.
- [ ] Configure Node.js runtime and function regions close to Neon.
- [ ] Confirm Vercel request-body and function limits, then choose server or client Blob uploads accordingly.
- [ ] Configure Development, Preview, and Production environment scopes.
- [ ] Ensure `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is available during the relevant Vercel build.
- [ ] Mark secrets as sensitive in Vercel.
- [ ] Update production documentation and `.env.example`.

Required production variables:

```text
SITE_URL
DATABASE_URL
BLOB_READ_WRITE_TOKEN
ADMIN_USERNAME
ADMIN_PASSWORD_HASH
ADMIN_SESSION_SECRET
ADMIN_EMAIL
RESEND_API_KEY
RESEND_FROM_EMAIL
NEXT_PUBLIC_TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY
GOOGLE_SITE_VERIFICATION (optional until Search Console setup)
```

Exit condition: Vercel has every required non-secret setting and sensitive credential without any secret committed to Git.

## Phase 9 — Automated verification

- [ ] `npm audit` reports no high-severity vulnerabilities.
- [ ] Lint passes.
- [ ] Type checking passes.
- [ ] Tailwind/PostCSS compilation works after Vite removal.
- [ ] Standard `next build` passes and produces `.next` output.
- [ ] `next start` serves the production build locally.
- [ ] Production environment validation passes.
- [ ] Database migrations apply cleanly to an empty test database.
- [ ] Link and SEO checks pass.
- [ ] No Cloudflare runtime imports or bindings remain.
- [ ] No Vinext, Wrangler, D1, or R2 production dependency remains.
- [ ] No secret or server-only module appears in client bundles or generated public assets.
- [ ] Production checks no longer require a specific SQLite migration filename.

Exit condition: the repository is technically compatible with Vercel before creating a deployment.

## Phase 10 — Functional and responsive QA

- [ ] Test Home, About, Projects, project details, Contact, Blog, and article details.
- [ ] Test admin login, logout, dashboard, projects, blog, enquiries, resume, and settings.
- [ ] Test project and blog create, update, delete, publish, ordering, and optional images.
- [ ] Test image and resume uploads through Vercel Blob.
- [ ] Test Blob replacement/deletion and verify no unintended orphan or shared-file deletion.
- [ ] Test enquiry persistence and notification email.
- [ ] Test forgot-password OTP and password reset.
- [ ] Test error, loading, empty, validation, rate-limit, and unauthorized states.
- [ ] Test keyboard navigation and reduced motion.
- [ ] Test desktop, tablet, and mobile layouts.
- [ ] Verify no premium UI or animation regression.
- [ ] Compare all preserved routes, record counts, metadata, redirects, and representative page content with the baseline.

Exit condition: all critical user and admin journeys pass locally.

## Phase 11 — Vercel Preview and production readiness

- [ ] Push a migration branch and create a Vercel Preview deployment.
- [ ] Apply Preview database migrations and use isolated Preview resources where practical.
- [ ] Use a Neon Preview branch/database and non-production Blob/Resend/Turnstile settings where practical.
- [ ] Run smoke tests against the Preview URL.
- [ ] Inspect build logs, function logs, redirects, headers, and asset delivery.
- [ ] Confirm all environment variables are present in Production scope.
- [ ] Confirm production database and Blob backups/rollback path.
- [ ] Obtain explicit user approval before production deployment.
- [ ] Deploy to `amit-three.vercel.app` only after every blocking check passes.

Exit condition: production deployment is authorized, reversible, and verified.

## Files and areas expected to change

- `package.json` and `package-lock.json`
- `next.config.ts`
- `postcss.config.mjs` (add for Tailwind CSS 4)
- `vite.config.ts` (remove)
- `.openai/hosting.json` (remove at the final architecture cutover)
- `.env.example`, `.vercelignore` if needed, `env.d.ts`, `db/env.d.ts`, `tsconfig.json`, and `PRODUCTION.md`
- `db/**`, `drizzle.config.ts`, `drizzle/**`, and database export/import scripts
- `lib/env.ts`, `lib/content.ts`, `lib/admin-data.ts`, `lib/admin-security.ts`
- `lib/request-security.ts` and authentication helpers
- `proxy.ts` and production security/CSP configuration
- `app/api/**`
- Dynamic project/blog pages, sitemap, and upload/media handling
- Production verification scripts

## Non-goals

- Do not redesign the portfolio.
- Do not remove requested admin functionality.
- Do not deploy during migration without explicit user approval.
- Do not delete D1/R2 data before Neon/Blob migration is verified.
- Do not commit passwords, API keys, database URLs, or service tokens.

## Final completion criteria

The migration is complete only when all phases are marked complete, the standard Next.js production build passes, data and media counts match, critical workflows pass on a Vercel Preview deployment, no Cloudflare runtime dependency remains, and the user authorizes production deployment.
