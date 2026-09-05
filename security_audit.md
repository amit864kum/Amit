# Security audit

**Date:** 2026-09-05  
**Scope:** Application source, all page/API routes, admin authentication and recovery, D1/R2 access, request validation, browser headers, environment/deployment checks, dependencies, and tracked-secret exposure. This is a source-assisted audit of the current workspace; it does not include black-box testing of a deployed production hostname or Cloudflare account/IAM configuration.

## Remediation status

**Updated:** 2026-09-05  
All nine source findings below have been remediated. Security regression checks, ESLint, the production build, and the dependency audit pass. The existing hosted Site is still missing `ADMIN_EMAIL`, Resend, and Turnstile runtime values, so the corrected build has intentionally not replaced the live version; production contact/recovery functions now fail closed until those external credentials are configured.

## Original audit summary

No critical vulnerability or direct unauthenticated database/object-store access was found. The audit found **1 high, 4 medium, and 4 low** issues. The highest priority is the bypassable rate limiter, followed by password-recovery leakage, session revocation, CSRF hardening, and fail-open bot protection.

| ID | Severity | Finding | Status |
|---|---|---|---|
| H-01 | High | Rate limits are bypassable and permit unbounded key creation | Resolved |
| M-01 | Medium | Password-recovery responses disclose whether the admin identity matched | Resolved |
| M-02 | Medium | Recovery OTP is returned to the client outside `NODE_ENV=production` | Resolved |
| M-03 | Medium | Password reset does not invalidate existing admin sessions | Resolved |
| M-04 | Medium | Authenticated write routes lack same-origin/CSRF validation | Resolved |
| L-01 | Low | CSP permits all inline scripts | Resolved |
| L-02 | Low | Upload validation trusts client-declared MIME type | Resolved |
| L-03 | Low | Turnstile validation is fail-open when unconfigured and does not bind the expected hostname | Resolved in code; hosted credentials required |
| L-04 | Low | PBKDF2 work factor is below the current defensive baseline | Resolved |

## Findings

### H-01 — Bypassable rate limits and unbounded limiter storage

**Evidence:** `lib/request-security.ts:29-49,57-65`; used by login, recovery, reset, and contact routes. The limiter key includes the attacker-controlled `User-Agent`. Changing that header creates a fresh bucket, allowing login brute force and contact spam from one IP. Each variant also creates a permanent D1 row; there is an index for cleanup but no cleanup operation, enabling storage growth.

**Fix:** Key security limits by trusted Cloudflare client IP plus account/action—not `User-Agent`; add an account-wide login limit and progressive backoff; periodically delete expired rows; apply a Cloudflare edge/WAF rate limit as a second layer.

### M-01 — Admin identity enumeration in password recovery

**Evidence:** `lib/admin-security.ts:73-89`, `app/api/admin/password/forgot/route.ts:13-15`. An unknown identifier returns immediately with no `delivery` field. A matching identity performs DB/email work and returns `delivery`, or returns 429/503 in states where an unknown identity still returns 200. These status/body/timing differences reveal whether a username or email matched.

**Fix:** Always return the same status and fixed response schema/message, enqueue delivery asynchronously, and apply equivalent timing. Keep internal delivery/rate-limit results out of the public response.

### M-02 — OTP disclosure on non-production deployments

**Evidence:** `lib/admin-security.ts:51-68,88`, `app/api/admin/password/forgot/route.ts:15`. When `NODE_ENV` is not exactly `production`, a failed or absent Resend configuration returns the live reset code as `previewCode` to the unauthenticated caller.

**Impact:** Any reachable preview, staging, or accidentally development-mode deployment can expose a valid password-reset OTP and permit admin takeover.

**Fix:** Never return reset codes over HTTP. Put local-only codes in an explicitly enabled development mail sink, bound to loopback, and make recovery fail closed elsewhere.

### M-03 — Password reset leaves existing sessions valid

**Evidence:** `lib/admin.ts:8,43-63`; `lib/admin-security.ts:105-112`. Sessions are stateless HMAC tokens valid for 12 hours. Resetting the password changes only the password hash; tokens issued before the reset remain accepted.

**Fix:** Store a session/version counter or `credentials_updated_at` value and include/check it in every token, incrementing it on reset. Consider shorter sessions and explicit server-side revocation.

### M-04 — Missing CSRF checks on authenticated mutations

**Evidence:** Only login/recovery/contact call `sameOriginRequest`. `app/api/admin/{messages,posts,projects,resume,upload}/route.ts` and logout accept authenticated mutations without validating `Origin`/`Sec-Fetch-Site` or a CSRF token.

**Impact:** `SameSite=Strict` blocks ordinary cross-site attacks, but it is site-scoped rather than origin-scoped. A compromised/untrusted sibling subdomain can send simple requests with the cookie; JSON handlers also parse JSON bodies without requiring `application/json`.

**Fix:** Apply strict origin validation to every state-changing admin route, require the expected content type, and add a CSRF token. Keep `SameSite=Strict` as defense in depth.

### L-01 — CSP allows arbitrary inline scripts

**Evidence:** `proxy.ts:9` sets `script-src 'self' 'unsafe-inline' ...`.

**Impact:** The policy cannot block an injected inline script if a future HTML-injection flaw is introduced.

**Fix:** Replace `unsafe-inline` with per-request nonces or hashes and pass the nonce to framework/application scripts. Retain the existing `object-src`, `base-uri`, and `frame-ancestors` restrictions.

### L-02 — File type is not verified from content

**Evidence:** `app/api/admin/upload/route.ts:7-16` trusts `File.type`, then stores bytes under that declared content type. `app/api/media/[key]/route.ts:8-15` serves the object, and PDFs are displayed inline.

**Fix:** Verify magic bytes and decode/re-encode images; validate PDFs with a parser; reject polyglots/malformed files; serve PDFs as attachments or from an isolated cookieless origin. Enforce request-size limits before multipart parsing at the edge.

### L-03 — Incomplete/fail-open Turnstile enforcement

**Evidence:** `lib/request-security.ts:101-117` accepts all submissions when `TURNSTILE_SECRET_KEY` is absent and accepts successful responses without checking the returned hostname. The current environment check fails because both Turnstile keys are absent, so this is a release blocker rather than proof of the production state.

**Fix:** Fail closed in production, validate `hostname` and require `action === 'contact'`, and make deployment refuse to start without both keys. Keep the environment preflight in CI/CD rather than as an optional manual command.

### L-04 — Low PBKDF2 work factor

**Evidence:** `lib/security-crypto.ts:20-35` fixes PBKDF2-HMAC-SHA-256 at 100,000 iterations.

**Fix:** Benchmark and raise the cost to the current OWASP/platform baseline (or use Argon2id/scrypt where supported), encode the cost in each hash, and transparently rehash after a successful login. The generated high-entropy admin password reduces current practical risk.

## Verified controls

- All admin pages and data-changing routes require the signed, HTTP-only admin session; cookies are `Secure` in production and `SameSite=Strict`.
- SQL statements use bound parameters; no SQL-injection sink was found.
- Public post/project text is rendered through React escaping; structured JSON escapes `<`; no direct stored-XSS sink was found.
- Contact input has length/allow-list checks, same-origin validation, a honeypot, timing check, and HTML escaping before email delivery.
- Security headers include HSTS on HTTPS production requests, frame denial, MIME sniffing prevention, restrictive permissions, and referrer policy.
- `.dev.vars` is ignored and not tracked. No plaintext production credential was found in the current tracked source inspected.
- `npm audit --json`: **0 known dependency vulnerabilities** across 742 installed dependency entries.
- ESLint, production build, and the source production check passed. The environment check correctly failed on missing Resend/Turnstile keys and a non-HTTPS local `SITE_URL`; do not deploy until it passes with production values.

## Remediation order

1. Fix H-01, remove all client OTP disclosure, and make Turnstile fail closed in production.
2. Make password recovery indistinguishable and revoke sessions on password change/reset.
3. Add centralized same-origin/CSRF enforcement to every admin mutation.
4. Harden CSP, uploads, and password hashing.
