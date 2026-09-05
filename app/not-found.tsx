import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <main className="inner-page not-found-page">
    <SiteHeader solid />
    <section className="page-hero">
      <p className="eyebrow">404 / Page not found</p>
      <h1>This page has<br /><span className="serif-line">moved or <em>never existed.</em></span></h1>
      <p>Return to Amit Kumar&apos;s portfolio or explore the latest project case studies.</p>
      <div className="hero-actions"><Link className="button button-primary" href="/">Back home</Link><Link className="text-link" href="/projects">Explore projects</Link></div>
    </section>
    <SiteFooter />
  </main>;
}
