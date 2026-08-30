declare namespace Cloudflare {
  interface Env {
    FILES: R2Bucket;
    ADMIN_USERNAME: string;
    ADMIN_PASSWORD_HASH: string;
    ADMIN_SESSION_SECRET: string;
    ADMIN_EMAIL: string;
    RESEND_API_KEY: string;
    RESEND_FROM_EMAIL: string;
    NEXT_PUBLIC_GA_MEASUREMENT_ID: string;
    GA4_PROPERTY_ID: string;
    GOOGLE_ANALYTICS_CLIENT_EMAIL: string;
    GOOGLE_ANALYTICS_PRIVATE_KEY: string;
  }
}
