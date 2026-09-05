# Vercel Migration Plan

Last updated: 2026-09-06

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
| Source migration | Complete | Standard Next.js, Neon PostgreSQL, Vercel Blob, environment, and API adaptations are implemented. |
| Data migration | In progress | Local D1/R2 backup and export complete; destination import requires Neon/Blob credentials. |
| Vercel resources | Needs user action | Neon and Vercel Blob must be provisioned. |
| Verification | In progress | Audit, lint, typecheck, source security checks, and `next build` pass; credential-backed runtime QA remains. |
| Deployment | Not authorized | Do not deploy until the user explicitly requests it. |

## Current implementation checkpoint

| Deliverable | Status | Result |
|---|---|---|
| Cloudflare state backup | Complete | Versioned D1 and R2 copy stored in ignored `.migration-backup`. |
| Local content/media export | Complete | 8 projects, 2 posts, 1 enquiry, settings/security records, and 8 media files exported. |
| Next.js runtime cutover | Complete | Native `next dev`, `next build`, and `next start`; Vinext/Vite/Workers removed. |
| PostgreSQL source migration | Complete | Seven-table PostgreSQL schema and first Drizzle migration generated. |
| Blob source migration | Complete | Direct authenticated uploads and post-upload signature verification implemented. |
| Automated source gates | Complete | npm audit, lint, TypeScript, security checks, and production build pass. |
| Destination data import | Needs user action | Requires provisioned `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN`. |
| Preview workflow QA | Needs user action | Requires Vercel Preview plus Resend/Turnstile credentials. |

## Phase 0 — Safety and baseline

- [x] Record the current Git status and preserve unrelated user changes.
- [x] Run the existing audit, lint, build, and production checks as a baseline.
- [x] Back up the local D1 database and existing migrations.
- [x] Inventory all project, blog, enquiry, admin, resume, and media records.
- [x] Inventory any existing R2/local uploaded media.
- [x] Inventory every Cloudflare binding, Worker import, generated declaration, and platform-specific build file.
- [x] Record current route behaviour, record counts, and representative dynamic URLs for post-migration comparison.
- [x] Confirm `.env.example` contains placeholders only.
- [x] Confirm `.dev.vars` and all real credentials remain ignored by Git.
- [!] Rotate the exposed Resend API key.
- [!] Rotate the exposed Turnstile secret key.

Exit condition: a recoverable backup and baseline report exist before removing Cloudflare code.

## Phase 1 — Standard Next.js runtime

- [x] Replace Vinext scripts with `next dev`, `next build`, and `next start`.
- [x] Review and update the existing `next.config.ts` for standard Next.js, Blob image hosts, security, and Vercel behaviour.
- [x] Add `postcss.config.mjs` so the existing Tailwind CSS 4 import continues to compile without Vite.
- [x] Remove Vinext, Vite, Wrangler, Cloudflare Vite, Workers types, and Sites Vite dependencies.
- [x] Remove `vite.config.ts` and the Worker production-preview helper.
- [x] Remove every `cloudflare:workers` import.
- [x] Remove Cloudflare types from `tsconfig.json`.
- [x] Replace or remove Cloudflare declarations in `env.d.ts` and `db/env.d.ts`.
- [x] Replace runtime binding access with a validated server-only `process.env` configuration module.
- [x] Mark environment and database modules as server-only so secrets cannot enter client bundles.
- [x] Use the Node.js runtime for database, crypto, email, and upload handlers where required.
- [x] Keep `NEXT_PUBLIC_*` values limited to genuinely public browser configuration.
- [x] Preserve the existing App Router pages, components, CSS, fonts, motion, and visual design.

Exit condition: the application compiles far enough under standard Next.js to expose the remaining database/storage migration errors clearly.

## Phase 2 — PostgreSQL and Drizzle migration

- [!] Provision or connect a Neon PostgreSQL database through Vercel Marketplace.
- [x] Add the Neon serverless driver and PostgreSQL Drizzle configuration.
- [x] Update `drizzle.config.ts` from SQLite to PostgreSQL and source its URL securely.
- [x] Convert the SQLite/D1 schema to PostgreSQL types and constraints.
- [x] Convert projects, posts, enquiries, resume settings, admin security, password resets, and rate limits.
- [x] Replace all `env.DB.prepare`, `batch`, `first`, and `all` calls.
- [x] Replace SQLite-specific SQL with parameterized PostgreSQL queries.
- [x] Preserve display ordering, publication state, slugs, JSON content blocks, timestamps, and optional images.
- [x] Preserve integer flags and serialized JSON safely with PostgreSQL-compatible values.
- [x] Exclude the removed analytics and consent tables from the new schema and data import.
- [x] Add indexes for slugs, publication state, display order, reset lookups, and rate-limit windows.
- [x] Generate and inspect PostgreSQL migrations.
- [x] Create an idempotent seed/import path for initial portfolio content.

Exit condition: all public and admin data access runs through Neon-compatible Drizzle code.

## Phase 3 — Existing data transfer

- [x] Create a read-only D1 export utility.
- [x] Export every table to a versioned local backup outside public assets.
- [x] Create a Neon import utility with duplicate protection.
- [!] Import projects, posts, enquiries, resume settings, and admin security data.
- [x] Begin with clean password-reset and rate-limit records; historical rows remain only in the backup.
- [x] Reset PostgreSQL identity sequences after preserving imported numeric IDs.
- [!] Compare source and destination record counts.
- [!] Validate representative project and blog records field by field.
- [x] Preserve current slugs so existing URLs do not break.

Exit condition: Neon contains a verified copy of all required D1 data.

## Phase 4 — Vercel Blob migration

- [!] Create a public Vercel Blob store for portfolio media.
- [x] Add `@vercel/blob` and configure `BLOB_READ_WRITE_TOKEN`.
- [x] Rewrite the authenticated admin upload route.
- [x] Enforce file-size, MIME-type, extension, filename, authorization, and post-upload signature validation.
- [x] Use collision-resistant paths and Blob delivery cache behaviour.
- [x] Store returned Blob URLs in PostgreSQL.
- [x] Update project, blog, resume, and media rendering.
- [x] Configure `next/image` remote patterns for the Blob hostname.
- [!] Transfer existing uploaded media and rewrite old URLs using the completed import utility.
- [x] Delete replaced/deleted Blobs only after database updates and only when no remaining record references the asset.
- [x] Remove R2 `FILES` binding access and obsolete media proxy code.

Exit condition: uploads, reads, optional images, and resume files work without R2.

## Phase 5 — API and authentication adaptation

- [x] Convert every API endpoint to a standard Next.js Route Handler.
- [x] Preserve admin login, logout, enquiries, projects, posts, resume, uploads, forgot-password, and reset-password APIs.
- [x] Preserve PBKDF2 password verification and timing-safe comparisons.
- [x] Preserve signed `HttpOnly`, `Secure`, and `SameSite=Strict` session cookies.
- [x] Store reset password overrides and OTP state in PostgreSQL.
- [x] Keep generic authentication errors and no-store private responses.
- [x] Validate same-origin and CSRF-sensitive requests against `SITE_URL`.
- [x] Trust Vercel forwarding headers when deriving client IPs and origins.
- [x] Ensure protected admin pages redirect safely without open redirects.
- [x] Add explicit cache/revalidation behaviour after project, blog, and resume mutations so public pages update immediately.
- [x] Confirm dynamic public pages are rendered at request time rather than frozen at build time.

Exit condition: every admin and public API works in the Vercel Node.js runtime.

## Phase 6 — Abuse protection and email

- [x] Port the rate limiter from D1 to an atomic PostgreSQL implementation.
- [x] Retain separate limits for login, OTP, reset, contact, and authenticated upload actions.
- [x] Keep Turnstile client rendering and server-side Siteverify validation.
- [!] Register `amit-three.vercel.app` in the Turnstile widget after rotating its secret.
- [x] Define a safe Turnstile strategy for changing Vercel Preview hostnames, using approved Preview hostnames or Cloudflare test keys outside production.
- [x] Retain Resend enquiry notifications and reset OTP delivery.
- [!] Configure and verify the production Resend sender.
- [x] Add request timeouts, idempotency, sanitized logs, and secure failure responses.
- [x] Keep CSP compatible with Blob-hosted images and Turnstile without exposing server-only Resend access.

Exit condition: contact, authentication, and upload endpoints resist common spam and brute-force abuse.

## Phase 7 — SEO and content integrity

- [x] Preserve unique metadata and canonical URLs for every public page.
- [x] Preserve project and blog dynamic metadata.
- [x] Preserve Open Graph, Twitter cards, Person/ProfilePage JSON-LD, robots, sitemap, and manifest.
- [x] Set canonical production origin to `https://amit-three.vercel.app`.
- [x] Preserve descriptive image alt text and heading hierarchy.
- [x] Ensure sitemap records come from PostgreSQL.
- [x] Ensure deleted or unpublished records return correct 404 responses.
- [x] Preserve legacy `/work/*` and current `/projects/*` route behaviour.
- [!] Complete Search Console verification and submit the production sitemap only after the final Vercel URL is live.
- [x] Keep existing SEO copy natural and avoid keyword stuffing.

Exit condition: migration produces no SEO regression or broken indexed URL.

## Phase 8 — Vercel configuration

- [x] Remove `.openai/hosting.json` after eliminating Cloudflare runtime dependencies.
- [x] Avoid `vercel.json`; Next.js Proxy owns the required headers and no platform override is needed.
- [x] Add `.vercelignore` to exclude local backups, Cloudflare state, generated output, and migration exports.
- [x] Configure production security headers for the Vercel runtime.
- [!] Select a Neon region and align the Vercel function region during resource setup.
- [x] Confirm Vercel's 4.5 MB Function request limit and use authenticated direct client Blob uploads.
- [!] Configure Development, Preview, and Production environment scopes.
- [!] Ensure `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is available during the relevant Vercel build.
- [!] Mark secrets as sensitive in Vercel.
- [x] Update production documentation and `.env.example`.

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

- [x] `npm audit` reports no known vulnerabilities.
- [x] Lint passes.
- [x] Type checking passes.
- [x] Tailwind/PostCSS compilation works after Vite removal.
- [x] Standard `next build` passes and produces `.next` output.
- [x] `next start` launches the production build and serves static metadata routes locally.
- [!] Production environment validation passes after Vercel variables are configured.
- [!] Database migrations apply cleanly after a Neon test/Preview database is provisioned.
- [ ] Re-run link and SEO checks against a credential-backed Preview deployment.
- [x] No Cloudflare runtime imports or bindings remain.
- [x] No Vinext, Wrangler, D1, or R2 production dependency remains.
- [x] No tracked secret value was detected; client-bundle inspection remains part of Preview QA.
- [x] Production checks require the PostgreSQL migration rather than an old SQLite migration filename.

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
