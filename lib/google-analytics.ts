import { env } from 'cloudflare:workers';

export type GoogleAnalyticsSnapshot = {
  configured: boolean;
  connected: boolean;
  error?: string;
  totals?: { activeUsers: number; sessions: number; pageViews: number; events: number };
};

function config(name: string) {
  const runtime = env as unknown as Record<string, string | undefined>;
  return runtime[name] ?? process.env[name] ?? '';
}

function base64Url(value: string | Uint8Array) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function privateKeyBytes(pem: string) {
  const normalized = pem.replaceAll('\\n', '\n');
  const base64 = normalized.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  if (!base64) throw new Error('The service-account private key is invalid.');
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

async function accessToken(email: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64Url(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claims}`;
  const key = await crypto.subtle.importKey('pkcs8', privateKeyBytes(privateKey), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signature = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned)));
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${base64Url(signature)}` }),
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) throw new Error('Google authorization failed.');
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error('Google did not return an access token.');
  return data.access_token;
}

export async function getGoogleAnalyticsSnapshot(): Promise<GoogleAnalyticsSnapshot> {
  const propertyId = config('GA4_PROPERTY_ID').replace(/^properties\//, '');
  const email = config('GOOGLE_ANALYTICS_CLIENT_EMAIL');
  const privateKey = config('GOOGLE_ANALYTICS_PRIVATE_KEY');
  const configured = Boolean(propertyId && email && privateKey);
  if (!configured) return { configured: false, connected: false };
  try {
    const token = await accessToken(email, privateKey);
    const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }, { name: 'eventCount' }],
      }),
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) throw new Error('Google Analytics reporting request failed.');
    const report = await response.json() as { rows?: Array<{ metricValues?: Array<{ value?: string }> }> };
    const values = report.rows?.[0]?.metricValues || [];
    return {
      configured: true,
      connected: true,
      totals: {
        activeUsers: Number(values[0]?.value || 0),
        sessions: Number(values[1]?.value || 0),
        pageViews: Number(values[2]?.value || 0),
        events: Number(values[3]?.value || 0),
      },
    };
  } catch (error) {
    return { configured: true, connected: false, error: error instanceof Error ? error.message : 'Google Analytics connection failed.' };
  }
}
