declare namespace Cloudflare {
  interface Env {
    FILES: R2Bucket;
    ADMIN_USERNAME: string;
    ADMIN_PASSWORD_HASH: string;
    ADMIN_SESSION_SECRET: string;
  }
}
