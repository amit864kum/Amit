import { env } from 'cloudflare:workers';
import { BarChart3, CheckCircle2, Database, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { requireAdminPage } from '@/lib/admin';
import { getAdminCounts } from '@/lib/admin-data';
import AdminShell from '../_components/AdminShell';

export const dynamic = 'force-dynamic';

function Status({ ready }: { ready: boolean }) {
  return <span className={ready ? 'studio-status-ready' : 'studio-status-pending'}>{ready ? 'Ready' : 'Setup needed'}</span>;
}

export default async function SettingsPage() {
  await requireAdminPage();
  const counts = await getAdminCounts();
  const emailReady = Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL);
  const trackingReady = Boolean(env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  const reportingReady = Boolean(env.GA4_PROPERTY_ID && env.GOOGLE_ANALYTICS_CLIENT_EMAIL && env.GOOGLE_ANALYTICS_PRIVATE_KEY);
  return <AdminShell counts={counts} eyebrow="System control" title="Settings" description="A safe overview of authentication, delivery, analytics, and storage configuration. Secret values are never displayed here.">
    <section className="studio-settings-grid">
      <article className="studio-panel studio-setting-card"><header><span><ShieldCheck /></span><Status ready={Boolean(env.ADMIN_SESSION_SECRET)} /></header><small>Administrator access</small><h2>Protected workspace</h2><p>Signed, HTTP-only session cookies protect every admin route and write endpoint.</p><ul><li><CheckCircle2 /> Username configured</li><li><CheckCircle2 /> Password stored as a PBKDF2 hash</li><li><CheckCircle2 /> Session signing active</li></ul></article>
      <article className="studio-panel studio-setting-card"><header><span><Mail /></span><Status ready={emailReady} /></header><small>Password recovery</small><h2>Email OTP delivery</h2><p>{emailReady ? `Verification codes are sent securely to ${env.ADMIN_EMAIL}.` : 'Local recovery displays a development-only OTP. Add Resend credentials before production.'}</p><ul><li><KeyRound /> 10-minute single-use codes</li><li><KeyRound /> Rate and attempt limits</li><li><KeyRound /> Protected destination: {env.ADMIN_EMAIL || 'admin email'}</li></ul></article>
      <article className="studio-panel studio-setting-card"><header><span><BarChart3 /></span><Status ready={trackingReady && reportingReady} /></header><small>Google Analytics 4</small><h2>External analytics</h2><p>Consent-gated GA4 tracking activates when the public Measurement ID is configured. Reporting credentials remain server-only.</p><ul><li className={trackingReady ? '' : 'is-muted'}>{trackingReady ? <CheckCircle2 /> : <span />} Measurement ID</li><li className={reportingReady ? '' : 'is-muted'}>{reportingReady ? <CheckCircle2 /> : <span />} Property and service account</li></ul></article>
      <article className="studio-panel studio-setting-card"><header><span><Database /></span><Status ready /></header><small>Application data</small><h2>Cloudflare D1 + R2</h2><p>The current Sites build stores structured content in D1 and uploaded media in R2. Both can remain local until you choose deployment.</p><ul><li><CheckCircle2 /> Projects, posts, enquiries</li><li><CheckCircle2 /> Consent-based event data</li><li><CheckCircle2 /> Uploaded project and article media</li></ul></article>
    </section>
    <article className="studio-panel studio-deployment-note"><div><small>Deployment boundary</small><h2>No deployment has been performed.</h2><p>The application remains local. Before production, configure Resend, GA4 and platform secrets in the chosen hosting environment, then run a final security and delivery test.</p></div><span>Local only</span></article>
  </AdminShell>;
}
