'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Post } from '@/lib/content';
import { readingTime } from '@/lib/blog';

function PostVisual({ post, priority = false }: { post: Post; priority?: boolean }) {
  return <div className={`blog-card-visual${post.imageUrl ? ' has-image' : ''}`}>{post.imageUrl ? <Image className="blog-card-image" src={post.imageUrl} alt={post.title} fill sizes="(max-width: 760px) 92vw, (max-width: 1100px) 86vw, 38vw" priority={priority} unoptimized={post.imageUrl.startsWith('/api/media/')} style={{ objectFit: 'contain', objectPosition: 'center' }} /> : <><span>AK / Blog</span><b>{post.category}</b></>}</div>;
}

export default function BlogExplorer({ posts }: { posts: Post[] }) {
  const categories = ['All', ...Array.from(new Set(posts.map((post) => post.category)))];
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const visible = useMemo(() => posts.filter((post) => {
    const matchesCategory = category === 'All' || post.category === category;
    const haystack = (post.title + ' ' + post.excerpt + ' ' + post.category).toLowerCase();
    return matchesCategory && haystack.includes(query.trim().toLowerCase());
  }), [posts, query, category]);
  const featured = visible.find((post) => post.featured) ?? visible[0];
  const remaining = visible.filter((post) => post.id !== featured?.id);

  return (
    <>
      <section className="blog-tools" aria-label="Find articles">
        <label><span>Search the blog</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ideas, systems, or technologies…" /></label>
        <div className="category-filter" aria-label="Filter by category">{categories.map((item) => <button key={item} type="button" className={category === item ? 'active' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <p>{visible.length} {visible.length === 1 ? 'article' : 'articles'}</p>
      </section>
      {featured && <section className="featured-post">
        <Link href={'/blog/' + featured.slug} className="featured-post-visual"><PostVisual post={featured} priority /></Link>
        <div><p className="eyebrow">Featured · {featured.category}</p><h2><Link href={'/blog/' + featured.slug}>{featured.title}</Link></h2><p>{featured.excerpt}</p><div className="post-meta"><time>{new Date(featured.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</time><span>{readingTime(featured.body).minutes} min read</span></div><Link className="read-link" href={'/blog/' + featured.slug}>Read the article ↗</Link></div>
      </section>}
      <section className="blog-grid">
        {remaining.map((post) => <article className="blog-card" key={post.id}><Link href={'/blog/' + post.slug}><PostVisual post={post} /></Link><div className="post-meta"><span>{post.category}</span><span>{readingTime(post.body).minutes} min</span></div><h2><Link href={'/blog/' + post.slug}>{post.title}</Link></h2><p>{post.excerpt}</p><Link className="read-link" href={'/blog/' + post.slug}>Read article ↗</Link></article>)}
      </section>
      {!visible.length && <div className="empty-blog"><h2>No matching notes.</h2><p>Try another keyword or category.</p></div>}
    </>
  );
}
