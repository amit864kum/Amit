import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { getPosts } from '@/lib/content';

export const dynamic = 'force-dynamic';
export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <main className="inner-page journal-page">
      <SiteHeader solid />
      <section className="page-hero"><p className="eyebrow">Notes & ideas</p><h1>What I&apos;m learning,<br /><span className="serif-line">building, and <em>questioning.</em></span></h1></section>
      <section className="post-list">
        {posts.map((post) => <Link href={'/blog/' + post.slug} key={post.id} className="post-row"><time>{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</time><div><h2>{post.title}</h2><p>{post.excerpt}</p></div><span>Read ↗</span></Link>)}
      </section>
      <SiteFooter />
    </main>
  );
}
