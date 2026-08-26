import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { getPost } from '@/lib/content';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? { title: post.title + ' — Amit Kumar', description: post.excerpt, openGraph: { title: post.title + ' — Amit Kumar', description: post.excerpt, images: [] }, twitter: { title: post.title + ' — Amit Kumar', description: post.excerpt, images: [] } } : {};
}
export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return <main className="inner-page article-page"><SiteHeader solid /><article><p className="eyebrow">Journal · {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p><h1>{post.title}</h1><p className="article-deck">{post.excerpt}</p><div className="article-body">{post.body.split('\n').map((p) => <p key={p}>{p}</p>)}</div></article><SiteFooter /></main>;
}
