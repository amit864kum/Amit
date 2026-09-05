# Production architecture

This portfolio is designed for Cloudflare Sites/Workers. Structured data uses the `DB` D1 binding and uploaded media uses the `FILES` R2 binding declared in `.openai/hosting.json`. Keeping the application on Cloudflare avoids a database and object-storage migration; Vercel is not the recommended target for the current implementation.

## Required production configuration

Configure these values in the hosting environment, never in Git:

- `SITE_URL`: the final HTTPS canonical domain.
- `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `ADMIN_EMAIL`.
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`: use a Resend-verified sending domain.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`: create a Cloudflare Turnstile widget for the production hostname.
- `GOOGLE_SITE_VERIFICATION`: the Search Console HTML-tag verification token.

Run `npm run check:env` with production values available before publishing. Apply the checked-in D1 migrations, confirm the `DB` and `FILES` bindings, then run `npm run verify`.

## Credential setup

### Administrator credentials

1. Run `npm run generate:admin` locally.
2. Save the displayed `ADMIN_PASSWORD` in a password manager. Do not add it to an environment file or hosting dashboard.
3. Add `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and `ADMIN_SESSION_SECRET` to the hosting environment.
4. Set `ADMIN_EMAIL=amitkumarabhinav59@gmail.com`.

### Resend email delivery

1. Create an account at Resend and verify the account email.
2. Create an API key from **API Keys** and save it as `RESEND_API_KEY`.
3. For initial testing, use `Amit Portfolio <onboarding@resend.dev>` as `RESEND_FROM_EMAIL`. A verified custom sending domain is recommended before client-facing launch.
4. Test both the contact form notification and admin password-reset OTP.

### Cloudflare Turnstile

1. In Cloudflare, open **Turnstile** and add a widget.
2. Choose **Managed** mode and add the final production hostname.
3. Save the public site key as `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
4. Save the private secret key as `TURNSTILE_SECRET_KEY`.

### Google Search Console

1. Create a URL-prefix property using the final HTTPS website URL.
2. Choose **HTML tag** verification.
3. Copy only the `content` value from the verification tag into `GOOGLE_SITE_VERIFICATION`.
4. Publish, click **Verify**, and submit `https://your-domain/sitemap.xml`.

## Search launch checklist

1. Add the final domain as a Search Console Domain property.
2. Set `GOOGLE_SITE_VERIFICATION`, publish, and verify ownership.
3. Submit `/sitemap.xml` and confirm `/robots.txt` is reachable.
4. Inspect the home page and two representative project/article URLs.
5. Keep one canonical hostname and redirect alternate hostnames to it.
