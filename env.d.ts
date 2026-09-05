declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    FILES: R2Bucket;
    ADMIN_USERNAME: string;
    ADMIN_PASSWORD_HASH: string;
    ADMIN_SESSION_SECRET: string;
    ADMIN_EMAIL: string;
    RESEND_API_KEY: string;
    RESEND_FROM_EMAIL: string;
    GOOGLE_SITE_VERIFICATION: string;
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: string;
    TURNSTILE_SECRET_KEY: string;
    SITE_URL: string;
  }
}
