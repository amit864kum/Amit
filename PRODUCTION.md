# Vercel production architecture

The portfolio now runs as one standard Next.js App Router project on Vercel:

- Next.js pages, Server Components, and Route Handlers run on Vercel.
- Neon PostgreSQL stores projects, posts, enquiries, resume settings, authentication overrides, password-reset codes, and rate-limit state.
- Vercel Blob stores public project images, article images, and the resume PDF.
- Resend sends contact notifications and password-reset codes.
- Cloudflare Turnstile remains an external bot-verification service; there are no Cloudflare Worker, D1, or R2 runtime bindings.

The production URL is `https://amit-three.vercel.app`.

## Required Vercel resources

### 1. Create or connect the Vercel project

1. In Vercel, choose **Add New → Project** and import this Git repository.
2. Confirm **Framework Preset: Next.js**.
3. Set **Node.js Version: 22.x**.
4. Set **Build Command** to `npm run vercel-build`.
5. Do not publish production traffic until the database migration and data import below are complete.

### 2. Create Neon PostgreSQL

1. In the Vercel project, open **Storage** or **Marketplace**.
2. Add **Neon Postgres** and connect it to this project.
3. Choose a region close to the Vercel function region.
4. Confirm Vercel created `DATABASE_URL` for Development, Preview, and Production as intended.
5. Pull variables locally with `npx vercel env pull .env.local`, or copy only the database URL into an ignored `.env.local` file.
6. Run `npm run db:migrate` once against the destination database. The Vercel build also runs this idempotent migration as a safety check.

### 3. Create Vercel Blob

1. In the same Vercel project, open **Storage → Create Database → Blob**.
2. Create a **Public** Blob store and connect it to the project.
3. Confirm `BLOB_READ_WRITE_TOKEN` is present in the required environment scopes.
4. Keep the token secret. The browser receives short-lived upload tokens only after admin authentication.

Large admin uploads go directly from the browser to Blob, avoiding Vercel's Function request-body limit. A protected server endpoint downloads and validates the uploaded file signature before its URL can be saved.

## Required environment variables

Add these under **Vercel → Project Settings → Environment Variables**. Secret values must never be committed to Git.

| Variable | Purpose | Scope |
|---|---|---|
| `SITE_URL` | Canonical production origin: `https://amit-three.vercel.app` | Production; use the intended origin in other scopes |
| `DATABASE_URL` | Neon pooled/serverless connection string | Development, Preview, Production |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob server credential | Development, Preview, Production |
| `ADMIN_USERNAME` | Admin login name | All required scopes |
| `ADMIN_PASSWORD_HASH` | Generated PBKDF2 hash, never the password | All required scopes |
| `ADMIN_SESSION_SECRET` | Generated session-signing secret | All required scopes |
| `ADMIN_EMAIL` | Password recovery destination | All required scopes |
| `RESEND_API_KEY` | Resend API credential | All required scopes |
| `RESEND_FROM_EMAIL` | Sender on a Resend-verified domain | All required scopes |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public Turnstile widget key | Build and runtime scopes |
| `TURNSTILE_SECRET_KEY` | Private Turnstile verification key | Runtime scopes |
| `GOOGLE_SITE_VERIFICATION` | Optional Search Console verification token | Production when configured |

Run `npm run check:env` with the intended environment loaded. `.dev.vars` belongs to the old Cloudflare runtime and is deliberately ignored by the Next.js environment checker.

## Administrator credentials

1. Run `npm run generate:admin` locally.
2. Save the displayed plaintext `ADMIN_PASSWORD` in a password manager. Do not place it in Vercel or any environment file.
3. Add only `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and `ADMIN_SESSION_SECRET` to Vercel.
4. Set `ADMIN_EMAIL=amitkumarabhinav59@gmail.com`.
5. Regenerating the hash replaces the fallback password. A password changed through the recovery flow is stored in PostgreSQL and invalidates older sessions.

## Existing Cloudflare data migration

A read-only export of the local Cloudflare state has already been created under the ignored `.migration-backup` directory. It contains 8 projects, 2 posts, 1 enquiry, 1 resume setting, 1 admin security record, 6 historical reset records, and 8 media files.

To repeat or complete the transfer:

1. Preserve `.wrangler` and `.migration-backup` until production verification is complete.
2. Run `npm run migrate:export` to create a fresh versioned export.
3. Configure ignored local `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` values for the destination.
4. Run `npm run db:migrate`.
5. Run `npm run migrate:import -- .migration-backup/<export-directory>`.
6. Compare the reported source and destination counts.
7. Open representative project, blog, resume, and admin records before removing any Cloudflare data.

The import is repeatable: records are upserted by primary key, media uses stable collision-resistant paths, old `/api/media/...` references are replaced with Vercel Blob URLs, and PostgreSQL sequences are corrected after import. Retired analytics, consent, historical password-reset, and transient rate-limit records are not migrated.

## Resend

1. Create a Resend account and verify the sending domain.
2. Create a restricted sending API key and store it as `RESEND_API_KEY`.
3. Set `RESEND_FROM_EMAIL` to an address on the verified domain.
4. Rotate any API key that was ever pasted into chat, source, or an example file.
5. Test both contact notification delivery and password-reset OTP delivery on Preview before production.

## Turnstile

1. In Cloudflare Turnstile, create a Managed widget.
2. Add `amit-three.vercel.app` as an allowed hostname.
3. Store the public key as `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and the rotated private key as `TURNSTILE_SECRET_KEY`.
4. Use Cloudflare test keys or explicitly approved Preview hostnames for Vercel Preview; production verification checks the hostname and action.
5. Rotate any secret key that was pasted into chat or committed anywhere.

## Release order

1. Provision Neon and Blob.
2. Configure every required Vercel environment variable.
3. Apply PostgreSQL migrations.
4. Import the D1/R2 export.
5. Run `npm run verify` locally with production-like values.
6. Create a Vercel Preview deployment and test public/admin workflows.
7. Verify response headers, canonical URLs, robots, sitemap, uploads, contact delivery, and password recovery.
8. Promote to Production only after explicit approval.

## Google Search Console

Search Console is independent of GA4 and is optional for deployment, but useful for indexing and SEO diagnostics. Add a URL-prefix property for the production URL, use HTML-tag verification, set only the tag's `content` value as `GOOGLE_SITE_VERIFICATION`, deploy, verify, and submit `https://amit-three.vercel.app/sitemap.xml`.
