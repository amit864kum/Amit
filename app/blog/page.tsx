import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import BlogExplorer from '@/components/BlogExplorer';
import { getPosts } from '@/lib/content';

export const dynamic = 'force-dynamic';
export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <main className="inner-page journal-page">
      <SiteHeader solid />
      <section className="page-hero blog-hero"><p className="eyebrow">Amit&apos;s field notes</p><h1>Systems, research,<br /><span className="serif-line">and the craft of <em>building.</em></span></h1><p>Practical essays on engineering reliable products, distributed systems, blockchain, and the decisions behind the work.</p></section>
      <BlogExplorer posts={posts} />
      <SiteFooter />
    </main>
  );
}
