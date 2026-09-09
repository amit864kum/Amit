'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { BookOpenText, BriefcaseBusiness, ExternalLink, FileUser, Gauge, Inbox, LogOut, Menu, Settings2, X } from 'lucide-react';
import type { AdminCounts } from '@/lib/admin-data';

const nav = [
  { href: '/admin', label: 'Dashboard', icon: Gauge, key: null },
  { href: '/admin/projects', label: 'Projects', icon: BriefcaseBusiness, key: 'projects' as const },
  { href: '/admin/resume', label: 'Resume', icon: FileUser, key: null },
  { href: '/admin/blog', label: 'Blog', icon: BookOpenText, key: 'posts' as const },
  { href: '/admin/enquiries', label: 'Enquiries', icon: Inbox, key: 'newEnquiries' as const },
];

export default function AdminShell({ counts, eyebrow, title, description, actions, children }: {
  counts: AdminCounts;
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);
  return (
    <main className="studio-shell" id="main-content">
      <aside id="admin-navigation" className={open ? 'studio-sidebar is-open' : 'studio-sidebar'} aria-label="Admin navigation">
        <Link href="/admin" className="studio-brand" aria-label="AK Studio dashboard"><span>AK</span><div><strong>Studio</strong><small>Portfolio control</small></div></Link>
        <button className="studio-nav-close" type="button" onClick={() => setOpen(false)} aria-label="Close admin navigation"><X /></button>
        <nav aria-label="Workspace"><small className="studio-nav-label">Workspace</small>
          {nav.map((item) => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} className={active ? 'active' : ''} onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined}>
              <Icon aria-hidden="true" /><span>{item.label}</span>{item.key ? <b>{counts[item.key]}</b> : null}
            </Link>;
          })}
        </nav>
        <div className="studio-sidebar-foot">
          <div className="studio-system-state"><i aria-hidden="true" /><span><strong>Production workspace</strong><small>Secure session active</small></span></div>
          <Link href="/" target="_blank">View portfolio <ExternalLink aria-hidden="true" /></Link>
          <Link href="/admin/settings" className={pathname.startsWith('/admin/settings') ? 'active' : ''} aria-current={pathname.startsWith('/admin/settings') ? 'page' : undefined}><Settings2 aria-hidden="true" /> Settings</Link>
          <form action="/api/admin/logout" method="post"><button type="submit"><LogOut aria-hidden="true" /> Log out</button></form>
        </div>
      </aside>
      <section className="studio-main">
        <div className="studio-mobile-bar"><button type="button" onClick={() => setOpen(true)} aria-label="Open admin navigation" aria-controls="admin-navigation" aria-expanded={open}><Menu aria-hidden="true" /></button><strong>AK Studio</strong><span><i aria-hidden="true" /> Secure</span></div>
        <header className="studio-page-head">
          <div><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></div>
          {actions ? <div className="studio-head-actions">{actions}</div> : null}
        </header>
        {children}
      </section>
      {open ? <button className="studio-scrim" type="button" onClick={() => setOpen(false)} aria-label="Close admin navigation" /> : null}
    </main>
  );
}
