import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ReadingProgress from '@/components/ReadingProgress';
import ShareActions from '@/components/ShareActions';
import { getPost, getPosts } from '@/lib/content';
import { articleImage, articleSections, readingTime } from '@/lib/blog';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: 'Article not found' };
  const images = post.imageUrl ? [{ url: post.imageUrl }] : [];
  return {
    title: post.title + ' — Amit Kumar',
    description: post.excerpt,
    openGraph: { title: post.title + ' — Amit Kumar', description: post.excerpt, type: 'article', images },
    twitter: { card: 'summary_large_image', title: post.title + ' — Amit Kumar', description: post.excerpt, images: post.imageUrl ? [post.imageUrl] : [] },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const posts = await getPosts();
  const index = posts.findIndex((item) => item.id === post.id);
  const related = posts.filter((item) => item.id !== post.id).sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category)).slice(0, 2);
  const sections = articleSections(post.body);
  const reading = readingTime(post.body);
  return (
    <main className="inner-page article-page">
      <ReadingProgress />
      <SiteHeader solid />
      <article className="blog-article">
        <Link href="/blog" className="back-to-blog">← Back to journal</Link>
        <header className="article-header">
          <p className="eyebrow">{post.category}</p>
          <h1>{post.title}</h1>
          <p className="article-deck">{post.excerpt}</p>
          <div className="article-meta"><Link href="/about" className="author-mini"><Image src="/amit-kumar.jpeg" alt="" width={42} height={42} /><span><b>Amit Kumar</b><small>Author & engineer</small></span></Link><time>{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</time><span>{reading.minutes} min read</span><span>{reading.words} words</span></div>
        </header>
        {post.imageUrl ? <div className="article-cover"><Image src={post.imageUrl} alt={post.title} fill sizes="(max-width: 980px) 92vw, 900px" priority /></div> : null}
        <div className="article-layout">
          <aside className="article-sidebar"><p>In this article</p><nav>{sections.map((section) => <a href={'#' + section.id} key={section.id}>{section.heading}</a>)}</nav><ShareActions title={post.title} /></aside>
          <div className="article-prose">{sections.map((section) => <section id={section.id} key={section.id}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph, paragraphIndex) => {
            const image = articleImage(paragraph);
            return image ? <figure className="article-inline-image" key={paragraphIndex}><div><Image src={image.src} alt={image.alt} fill sizes="(max-width: 820px) 92vw, 760px" loading="lazy" /></div><figcaption>{image.alt}</figcaption></figure> : <p key={paragraphIndex}>{paragraph}</p>;
          })}</section>)}</div>
        </div>
        <section className="author-card"><Image src="/amit-kumar.jpeg" alt="Amit Kumar" width={110} height={110} /><div><p className="eyebrow">About the author</p><h3>Amit Kumar</h3><p>Full-stack developer and blockchain engineer translating research and complex infrastructure into clear, dependable digital products.</p><Link href="/about">More about Amit ↗</Link></div></section>
        {related.length > 0 && <section className="related-posts"><div className="section-heading"><div><p className="eyebrow">Continue reading</p><h2>Related <em>field notes.</em></h2></div></div><div>{related.map((item) => <Link href={'/blog/' + item.slug} key={item.id}><span>{item.category}</span><h3>{item.title}</h3><p>{item.excerpt}</p><b>Read ↗</b></Link>)}</div></section>}
        <nav className="article-pagination" aria-label="Article pagination">{index > 0 ? <Link href={'/blog/' + posts[index - 1].slug}>← Newer<br /><b>{posts[index - 1].title}</b></Link> : <span />}{index >= 0 && index < posts.length - 1 ? <Link href={'/blog/' + posts[index + 1].slug}>Older →<br /><b>{posts[index + 1].title}</b></Link> : null}</nav>
      </article>
      <SiteFooter />
    </main>
  );
}
