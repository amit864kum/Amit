import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import BlogExplorer from '@/components/BlogExplorer';
import { getPosts } from '@/lib/content';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Blog — Engineering, Blockchain & Product Notes',
  description: 'Articles by Amit Kumar on full-stack engineering, blockchain products, distributed systems, research, and building dependable web experiences.',
  alternates: { canonical: '/blog' },
  openGraph: { title: 'Amit Kumar Blog — Engineering Field Notes', description: 'Practical writing on full-stack development, blockchain, distributed systems, and product engineering.', url: '/blog', images: [{ url: '/og-social.jpg', width: 1200, height: 630, alt: 'Amit Kumar engineering blog' }] },
  twitter: { card: 'summary_large_image', title: 'Amit Kumar Blog — Engineering Field Notes', description: 'Practical writing on full-stack development, blockchain, distributed systems, and product engineering.', images: ['/og-social.jpg'] },
};
export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <main className="inner-page journal-page">
      <SiteHeader solid />
      <section className="page-hero blog-hero"><div className="page-hero-orbit" aria-hidden="true"><i /><i /></div><p className="eyebrow">Amit&apos;s field notes</p><h1>Systems, research,<br /><span className="serif-line">and the craft of <em>building.</em></span></h1><p>Practical essays on engineering reliable products, distributed systems, blockchain, and the decisions behind the work.</p></section>
      <BlogExplorer posts={posts} />
      <SiteFooter />
    </main>
  );
}
import type { Metadata } from 'next';
