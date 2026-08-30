import { requireAdminPage } from '@/lib/admin';
import { getAdminCounts, getDashboardContent } from '@/lib/admin-data';
import AdminShell from './_components/AdminShell';
import Link from 'next/link';
import { ArrowUpRight, BookOpenText, BriefcaseBusiness, Eye, Inbox, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
export default async function AdminPage() {
  await requireAdminPage();
  const [counts, snapshot] = await Promise.all([getAdminCounts(), getDashboardContent()]);
  const cards = [
    { label: 'Total projects', value: counts.projects, detail: `${counts.featuredProjects} featured`, href: '/admin/projects', icon: BriefcaseBusiness, tone: 'violet' },
    { label: 'Blog library', value: counts.posts, detail: `${counts.publishedPosts} published · ${counts.drafts} drafts`, href: '/admin/blog', icon: BookOpenText, tone: 'blue' },
    { label: 'New enquiries', value: counts.newEnquiries, detail: `${counts.enquiries} total conversations`, href: '/admin/enquiries', icon: Inbox, tone: 'gold' },
    { label: 'Known visitors', value: counts.visitors, detail: 'Consent-based analytics', href: '/admin/analytics', icon: Eye, tone: 'teal' },
  ];
  return <AdminShell counts={counts} eyebrow="Command centre" title="Good morning, Amit." description="A clear view of your portfolio, audience, and next opportunities.">
    <section className="studio-kpi-grid" aria-label="Portfolio overview">
      {cards.map(({ icon: Icon, ...card }) => <Link href={card.href} key={card.label} className={`studio-kpi tone-${card.tone}`}>
        <span><Icon aria-hidden="true" /></span><small>{card.label}</small><strong>{String(card.value).padStart(2, '0')}</strong><p>{card.detail}</p><ArrowUpRight aria-hidden="true" className="studio-card-arrow" />
      </Link>)}
    </section>
    <section className="studio-dashboard-grid">
      <article className="studio-panel studio-content-pulse">
        <header><div><small>Content pulse</small><h2>Recently shaped</h2></div><Sparkles aria-hidden="true" /></header>
        <div className="studio-activity-list">{snapshot.content.map((item) => <a href={item.href} target="_blank" rel="noreferrer" key={`${item.kind}-${item.id}`}><span className={`kind-${item.kind}`}>{item.kind === 'project' ? 'PR' : 'BL'}</span><div><strong>{item.title}</strong><small>{item.meta}</small></div><ArrowUpRight aria-hidden="true" /></a>)}</div>
      </article>
      <article className="studio-panel studio-health-panel">
        <header><div><small>Publishing health</small><h2>Content readiness</h2></div><span>Live</span></header>
        <div className="studio-progress-block"><div><span>Featured project coverage</span><b>{counts.projects ? Math.round(counts.featuredProjects / counts.projects * 100) : 0}%</b></div><i><span style={{ width: `${counts.projects ? counts.featuredProjects / counts.projects * 100 : 0}%` }} /></i></div>
        <div className="studio-progress-block"><div><span>Published articles</span><b>{counts.posts ? Math.round(counts.publishedPosts / counts.posts * 100) : 0}%</b></div><i><span style={{ width: `${counts.posts ? counts.publishedPosts / counts.posts * 100 : 0}%` }} /></i></div>
        <p>Keep featured work focused and maintain a healthy draft pipeline for consistent publishing.</p>
      </article>
      <article className="studio-panel studio-enquiry-preview">
        <header><div><small>Opportunity inbox</small><h2>Latest enquiries</h2></div><Link href="/admin/enquiries">View all <ArrowUpRight /></Link></header>
        {snapshot.enquiries.length ? <div>{snapshot.enquiries.map((item) => <article key={item.id}><span className={item.status === 'new' ? 'is-new' : ''} /><div><strong>{item.name}</strong><small>{item.service} · {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</small></div><a href={`mailto:${item.email}`}>{item.email}</a></article>)}</div> : <p className="studio-empty">No enquiries yet. New conversations will appear here.</p>}
      </article>
      <article className="studio-panel studio-next-step">
        <small>Recommended next step</small><h2>{counts.drafts ? 'Take one draft across the finish line.' : 'Start the next useful note.'}</h2><p>{counts.drafts ? `You have ${counts.drafts} draft ${counts.drafts === 1 ? 'article' : 'articles'} waiting to be published.` : 'A steady publishing rhythm builds authority around your work.'}</p><Link href="/admin/blog">Open publishing studio <ArrowUpRight /></Link>
      </article>
    </section>
  </AdminShell>;
}
