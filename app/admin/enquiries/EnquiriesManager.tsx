'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, CheckCircle2, Mail, Search, X } from 'lucide-react';

export type Enquiry = { id: number; name: string; email: string; contactDetails: string; createdAt: string; status: string };

export default function EnquiriesManager({ enquiries }: { enquiries: Enquiry[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'new' | 'replied' | 'archived'>('all');
  const [search, setSearch] = useState('');
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const visible = useMemo(() => enquiries.filter((item) =>
    (filter === 'all' || item.status === filter)
    && `${item.name} ${item.email} ${item.contactDetails}`.toLowerCase().includes(search.toLowerCase()),
  ), [enquiries, filter, search]);
  const count = (status: string) => enquiries.filter((item) => item.status === status).length;

  async function update(id: number, status: string) {
    setPendingId(id);
    setFeedback('Updating enquiry…');
    try {
      const response = await fetch('/api/admin/messages', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, status }) });
      if (!response.ok) throw new Error();
      setFeedback(`Enquiry marked ${status}.`);
      router.refresh();
    } catch {
      setFeedback('The enquiry could not be updated. Please try again.');
    } finally {
      setPendingId(null);
    }
  }

  return <>
    <section className="studio-mini-stats">
      <article><span>Total conversations</span><strong>{enquiries.length}</strong></article>
      <article><span>Needs attention</span><strong>{count('new')}</strong></article>
      <article><span>Replied</span><strong>{count('replied')}</strong></article>
      <article><span>Archived</span><strong>{count('archived')}</strong></article>
    </section>
    <section className="studio-inbox">
      <header>
        <div className="studio-inbox-filters">{(['all', 'new', 'replied', 'archived'] as const).map((item) => <button type="button" key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}<span>{item === 'all' ? enquiries.length : count(item)}</span></button>)}</div>
        <label><Search aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or contact details" aria-label="Search enquiries" />{search ? <button type="button" onClick={() => setSearch('')} aria-label="Clear enquiry search"><X aria-hidden="true" /></button> : null}</label>
      </header>
      <div className="studio-inbox-summary"><span>{visible.length} {visible.length === 1 ? 'conversation' : 'conversations'} shown</span><p className={feedback.startsWith('The enquiry') ? 'is-error' : ''} role="status" aria-live="polite">{feedback}</p></div>
      <div className="studio-message-grid">
        {visible.length ? visible.map((item) => <article key={item.id} className={item.status === 'new' ? 'is-new' : ''} aria-busy={pendingId === item.id}>
          <header>
            <div className="studio-avatar">{item.name.slice(0, 2).toUpperCase()}</div>
            <div><h2>{item.name}</h2><a href={`mailto:${item.email}`}>{item.email}</a></div>
            <span className={`status-${item.status}`}>{item.status}</span>
          </header>
          <div className="studio-message-meta"><span>Contact details</span><time>{new Date(item.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></div>
          <p>{item.contactDetails}</p>
          <footer>
            <a href={`mailto:${item.email}?subject=${encodeURIComponent('Re: Your portfolio enquiry')}`}><Mail aria-hidden="true" /> Reply by email</a>
            {item.status !== 'replied' ? <button type="button" disabled={pendingId === item.id} onClick={() => update(item.id, 'replied')}><CheckCircle2 aria-hidden="true" /> Mark replied</button> : null}
            {item.status !== 'archived' ? <button type="button" disabled={pendingId === item.id} onClick={() => update(item.id, 'archived')}><Archive aria-hidden="true" /> Archive</button> : <button type="button" disabled={pendingId === item.id} onClick={() => update(item.id, 'new')}>Restore</button>}
          </footer>
        </article>) : <p className="studio-empty">No enquiries match this view.</p>}
      </div>
    </section>
  </>;
}
