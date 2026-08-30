import { Activity, ArrowUpRight, Eye, MousePointerClick, Radio, Users } from 'lucide-react';
import { requireAdminPage } from '@/lib/admin';
import { getAdminCounts } from '@/lib/admin-data';
import { getAnalyticsOverview } from '@/lib/analytics';
import { getGoogleAnalyticsSnapshot } from '@/lib/google-analytics';
import AdminShell from '../_components/AdminShell';

export const dynamic = 'force-dynamic';

function Ranking({ title, eyebrow, items }: { title: string; eyebrow: string; items: Array<{ label: string; value: number }> }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return <article className="studio-panel studio-ranking"><header><div><small>{eyebrow}</small><h2>{title}</h2></div></header><div>
    {items.length ? items.map((item) => <div className="studio-rank-row" key={item.label}><div><span title={item.label}>{item.label}</span><b>{item.value}</b></div><i aria-hidden="true"><span style={{ width: `${Math.max(4, item.value / max * 100)}%` }} /></i></div>) : <p className="studio-empty">No consented activity yet.</p>}
  </div></article>;
}

export default async function AnalyticsPage() {
  await requireAdminPage();
  const [counts, analytics, google] = await Promise.all([getAdminCounts(), getAnalyticsOverview(30), getGoogleAnalyticsSnapshot()]);
  const configured = google.configured;
  const maxDaily = Math.max(...analytics.daily.map((item) => item.views), 1);
  const cards = [
    { label: 'Consented visitors', value: analytics.totals.visitors, detail: 'Anonymous unique browsers', icon: Users, tone: 'violet' },
    { label: 'Page views', value: analytics.totals.views, detail: `${analytics.totals.sessions} browsing sessions`, icon: Eye, tone: 'blue' },
    { label: 'Section views', value: analytics.totals.sectionViews, detail: 'Sections entering the viewport', icon: Activity, tone: 'teal' },
    { label: 'Contact intent', value: analytics.totals.contactIntents, detail: 'CTA clicks and submitted forms', icon: MousePointerClick, tone: 'gold' },
  ];
  return <AdminShell counts={counts} eyebrow="Audience intelligence" title="Analytics" description="Privacy-respecting behaviour signals from visitors who explicitly accepted analytics cookies." actions={<a className="studio-primary-action" href="https://analytics.google.com/" target="_blank" rel="noreferrer">Open GA4 <ArrowUpRight /></a>}>
    <section className="studio-kpi-grid" aria-label="Thirty day analytics overview">{cards.map(({ icon: Icon, ...card }) => <article className={`studio-kpi tone-${card.tone}`} key={card.label}><span><Icon aria-hidden="true" /></span><small>{card.label}</small><strong>{card.value.toLocaleString('en-IN')}</strong><p>{card.detail}</p></article>)}</section>
    <section className="studio-analytics-grid">
      <article className="studio-panel studio-traffic-chart"><header><div><small>Last 30 days</small><h2>Traffic rhythm</h2></div><span>{analytics.consent.rate}% opt-in</span></header><div className="studio-chart" role="img" aria-label="Daily page views over the last 30 days">
        {analytics.daily.length ? analytics.daily.map((item) => <div key={item.day} title={`${item.day}: ${item.views} views, ${item.visitors} visitors`}><i style={{ height: `${Math.max(5, item.views / maxDaily * 100)}%` }} /><span>{new Date(`${item.day}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span></div>) : <p className="studio-empty">Traffic will appear after a visitor accepts analytics cookies.</p>}
      </div><footer><span><i className="chart-dot views" /> Page views</span><span>{analytics.consent.accepted} accepted · {analytics.consent.rejected} rejected</span></footer></article>
      <article className={`studio-panel studio-connection ${google.connected ? 'is-connected' : ''}`}><Radio aria-hidden="true" /><small>Google Analytics 4</small><h2>{google.connected ? 'Live GA4 report' : configured ? 'Connection needs attention' : 'Ready to connect'}</h2><p>{google.connected && google.totals ? `${google.totals.activeUsers.toLocaleString('en-IN')} active users · ${google.totals.sessions.toLocaleString('en-IN')} sessions · ${google.totals.pageViews.toLocaleString('en-IN')} page views · ${google.totals.events.toLocaleString('en-IN')} events in 30 days.` : configured ? 'The credentials were found, but Google could not return a report. Confirm API access and grant the service account Viewer access to the GA4 property.' : 'Add a Measurement ID and service-account credentials after creating your free GA4 property. First-party analytics already works without them.'}</p><div><span>{google.connected ? 'Reporting live' : configured ? 'Check access' : 'Not connected'}</span><a href="/admin/settings">Connection settings <ArrowUpRight aria-hidden="true" /></a></div></article>
      <Ranking eyebrow="Discovery" title="Top pages" items={analytics.pages} />
      <Ranking eyebrow="Attention" title="Top sections" items={analytics.sections} />
      <Ranking eyebrow="Acquisition" title="Traffic sources" items={analytics.sources} />
      <Ranking eyebrow="Visitor context" title="Reasons for visiting" items={analytics.reasons} />
      <Ranking eyebrow="Technology" title="Device mix" items={analytics.devices} />
      <article className="studio-panel studio-visitors"><header><div><small>Anonymous journey log</small><h2>Recent consented visitors</h2></div><span>30 days</span></header><div className="studio-table-wrap"><table><thead><tr><th>Visitor</th><th>Intent</th><th>Device</th><th>Views</th><th>Pages visited</th><th>Last seen</th></tr></thead><tbody>{analytics.recentVisitors.map((visitor) => <tr key={visitor.visitorId}><td><code>{visitor.visitorId.slice(0, 8)}</code></td><td>{visitor.reason || 'Not provided'}</td><td>{visitor.device || 'Unknown'}</td><td>{visitor.views}</td><td title={visitor.pages}>{visitor.pages || '—'}</td><td>{new Date(visitor.lastSeen).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td></tr>)}</tbody></table>{!analytics.recentVisitors.length ? <p className="studio-empty">No visitor journeys have been recorded.</p> : null}</div></article>
    </section>
  </AdminShell>;
}
