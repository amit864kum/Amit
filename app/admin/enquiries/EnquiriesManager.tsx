'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, CheckCircle2, Mail, Search } from 'lucide-react';

export type Enquiry = { id: number; name: string; email: string; service: string; budget: string | null; message: string; createdAt: string; status: string };

export default function EnquiriesManager({ enquiries }: { enquiries: Enquiry[] }) {
  const router = useRouter(); const [filter, setFilter] = useState<'all' | 'new' | 'replied' | 'archived'>('all'); const [search, setSearch] = useState('');
  const visible = useMemo(() => enquiries.filter((item) => (filter === 'all' || item.status === filter) && `${item.name} ${item.email} ${item.service} ${item.message}`.toLowerCase().includes(search.toLowerCase())), [enquiries, filter, search]);
  const count = (status: string) => enquiries.filter((item) => item.status === status).length;
  async function update(id: number, status: string) { const response = await fetch('/api/admin/messages', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, status }) }); if (response.ok) router.refresh(); }
  return <><section className="studio-mini-stats"><article><span>Total conversations</span><strong>{enquiries.length}</strong></article><article><span>Needs attention</span><strong>{count('new')}</strong></article><article><span>Replied</span><strong>{count('replied')}</strong></article><article><span>Archived</span><strong>{count('archived')}</strong></article></section>
    <section className="studio-inbox"><header><div className="studio-inbox-filters">{(['all', 'new', 'replied', 'archived'] as const).map((item) => <button type="button" key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}<span>{item === 'all' ? enquiries.length : count(item)}</span></button>)}</div><label><Search aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search enquiries" aria-label="Search enquiries" /></label></header>
      <div className="studio-message-grid">{visible.length ? visible.map((item) => <article key={item.id} className={item.status === 'new' ? 'is-new' : ''}><header><div className="studio-avatar">{item.name.slice(0, 2).toUpperCase()}</div><div><h2>{item.name}</h2><a href={`mailto:${item.email}`}>{item.email}</a></div><span className={`status-${item.status}`}>{item.status}</span></header><div className="studio-message-meta"><span>{item.service}</span>{item.budget ? <span>{item.budget}</span> : null}<time>{new Date(item.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></div><p>{item.message}</p><footer><a href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(item.service)}`} onClick={() => update(item.id, 'replied')}><Mail /> Reply</a>{item.status !== 'replied' ? <button type="button" onClick={() => update(item.id, 'replied')}><CheckCircle2 /> Mark replied</button> : null}{item.status !== 'archived' ? <button type="button" onClick={() => update(item.id, 'archived')}><Archive /> Archive</button> : <button type="button" onClick={() => update(item.id, 'new')}>Restore</button>}</footer></article>) : <p className="studio-empty">No enquiries match this view.</p>}</div>
    </section></>;
}
