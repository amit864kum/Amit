import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { getProject } from '@/lib/content';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return { title: 'Project not found' };
  return { title: project.title + ' — Amit Kumar', description: project.summary, openGraph: { title: project.title + ' — Amit Kumar', description: project.summary, images: project.imageUrl ? [{ url: project.imageUrl }] : [] }, twitter: { card: 'summary_large_image', title: project.title + ' — Amit Kumar', description: project.summary, images: project.imageUrl ? [project.imageUrl] : [] } };
}
export default async function ProjectPage({ params }: Props) {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  return (
    <main className="inner-page case-page">
      <SiteHeader solid />
      <section className="case-hero">
        <p className="eyebrow">{project.category} · {project.year}</p>
        <h1>{project.title}</h1>
        <p>{project.summary}</p>
      </section>
      <section className="case-visual">
        {project.imageUrl ? <Image src={project.imageUrl} alt={project.title} fill sizes="96vw" priority /> : <span>Project screenshot can be added from the admin dashboard</span>}
      </section>
      <section className="case-body">
        <div><p className="eyebrow">The project</p><h2>Engineering clarity<br /><em>into complexity.</em></h2></div>
        <div><p>{project.body}</p><h3>Technology</h3><p>{project.tech}</p>
          <div className="case-links">
            {project.projectUrl && <a href={project.projectUrl} target="_blank" rel="noreferrer">Visit project ↗</a>}
            {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer">View source ↗</a>}
          </div>
        </div>
      </section>
      <div className="next-link"><Link href="/work">← All projects</Link></div>
      <SiteFooter />
    </main>
  );
}
