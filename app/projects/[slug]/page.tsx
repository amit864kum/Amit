import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Code2, Layers3 } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import MagneticLink from '@/components/MagneticLink';
import ProjectCaseMediaMotion from '@/components/ProjectCaseMediaMotion';
import { getProject, getProjects } from '@/lib/content';
import { articleBlocks, blockSections } from '@/lib/blog';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return { title: 'Project not found' };
  return {
    title: `${project.title} — Amit Kumar`, description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: `${project.title} — Amit Kumar`, description: project.summary, images: project.imageUrl ? [{ url: project.imageUrl }] : [] },
    twitter: { card: 'summary_large_image', title: `${project.title} — Amit Kumar`, description: project.summary, images: project.imageUrl ? [project.imageUrl] : [] },
  };
}

function isGitHubUrl(value: string | null) {
  try { return Boolean(value && new URL(value).hostname.replace(/^www\./, '') === 'github.com'); }
  catch { return false; }
}

export default async function ProjectPage({ params }: Props) {
  const slug = (await params).slug;
  const [project, projects] = await Promise.all([getProject(slug), getProjects()]);
  if (!project) notFound();

  const position = Math.max(0, projects.findIndex((item) => item.id === project.id));
  const nextProject = projects[(position + 1) % projects.length];
  const tech = project.tech.split(',').map((item) => item.trim()).filter(Boolean);
  const paragraphs = project.body.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
  const contentBlocks = project.contentJson ? articleBlocks(project.contentJson, '') : [];
  const contentSections = contentBlocks.length ? blockSections(contentBlocks) : [];
  const githubUrl = project.githubUrl || (isGitHubUrl(project.projectUrl) ? project.projectUrl : null);
  const liveUrl = project.projectUrl && !isGitHubUrl(project.projectUrl) ? project.projectUrl : null;
  const monogram = project.title.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();

  return <main className={`inner-page project-case-page${project.imageUrl ? ' has-project-media' : ' project-case-text-only'}`}>
    <SiteHeader solid />
    <section className="project-case-hero" aria-labelledby="project-title">
      <div className="project-case-atmosphere" aria-hidden="true"><i /><i /><span>{monogram}</span></div>
      <Link className="project-case-back" href="/projects"><ArrowLeft aria-hidden="true" /> All projects</Link>
      <div className="project-case-hero-grid">
        <div className="project-case-intro">
          <h1 id="project-title">{project.title}</h1><p className="project-case-deck">{project.summary}</p>
          {(liveUrl || githubUrl) ? <div className="project-case-actions">
            {liveUrl ? <a className="project-case-primary" href={liveUrl} target="_blank" rel="noreferrer">Visit live project <ArrowUpRight aria-hidden="true" /></a> : null}
            {githubUrl ? <a className="project-case-secondary" href={githubUrl} target="_blank" rel="noreferrer"><Code2 aria-hidden="true" /> View source</a> : null}
          </div> : null}
        </div>
      </div>
    </section>

    {project.imageUrl ? <section className="project-case-showcase" aria-label={`${project.title} project media`}>
      <header><div><span>Interface view</span><p>Project imagery</p></div><small>{project.category} / {project.year}</small></header>
      <ProjectCaseMediaMotion><figure className="project-case-browser"><div className="project-case-browser-bar" aria-hidden="true"><span><i /><i /><i /></span><b>{project.title.toLowerCase().replaceAll(' ', '-')}.project</b><em>AK</em></div><div className="project-case-image"><Image src={project.imageUrl} alt={`${project.title} project interface`} fill sizes="(max-width: 800px) 94vw, 88vw" priority /></div></figure></ProjectCaseMediaMotion>
    </section> : null}

    <section className="project-case-story" id="project-story">
      <aside><span>01 / Context</span><h2>From complexity<br />to <em>clarity.</em></h2><p>A focused look at the thinking, architecture, and product decisions behind the work.</p></aside>
      <article><p className="project-case-lead">{project.summary}</p><div className="project-case-prose">{paragraphs.map((paragraph, index) => <p key={`${project.id}-${index}`}>{paragraph}</p>)}</div><blockquote><span>Design intent</span><p>Make the system understandable at the interface, dependable underneath, and useful in the real workflow.</p></blockquote></article>
    </section>

    {contentSections.length ? <section className="project-case-walkthrough" aria-labelledby="walkthrough-title">
      <header><div><span>02 / Walkthrough</span><h2 id="walkthrough-title">Inside the product,<br /><em>step by step.</em></h2></div><p>Detailed decisions, workflows, and interface views arranged in the order the project was designed to be understood.</p></header>
      <div className="project-walkthrough-sections">{contentSections.map((section, sectionIndex) => <article key={`${section.id}-${sectionIndex}`}>
        <header><span>{String(sectionIndex + 1).padStart(2, '0')}</span><h3>{section.heading}</h3></header>
        <div className="project-walkthrough-flow">{section.blocks.map((block) => {
          if (block.type === 'paragraph') return <p key={block.id}>{block.text}</p>;
          if (block.type === 'image' && block.imageUrl) return <figure key={block.id}>{block.imageHeading ? <h4>{block.imageHeading}</h4> : null}<div className="project-walkthrough-image"><Image src={block.imageUrl} alt={block.alt || `${project.title} project screenshot`} fill sizes="(max-width: 800px) 94vw, 980px" loading="lazy" /></div>{block.imageDescription ? <figcaption>{block.imageDescription}</figcaption> : null}</figure>;
          return null;
        })}</div>
      </article>)}</div>
    </section> : null}

    <section className="project-case-system" aria-labelledby="system-title">
      <header><div><span>{contentSections.length ? '03' : '02'} / System</span><h2 id="system-title">The build behind<br /><em>the experience.</em></h2></div><p>Technology was selected around the problem—not the trend—so every layer has a clear responsibility.</p></header>
      <div className="project-system-blueprint">
        <article className="project-system-path">
          <header><span>Delivery architecture</span><b>{monogram} / System</b></header>
          <ol>
            <li><span>01</span><div><small>Frame</small><h3>Define the real problem.</h3><p>Align the user need, technical constraints, and outcome before choosing the implementation.</p></div></li>
            <li><span>02</span><div><small>Build</small><h3>Connect every layer.</h3><p>Shape the interface, application logic, and infrastructure as one understandable system.</p></div></li>
            <li><span>03</span><div><small>Prove</small><h3>Validate the workflow.</h3><p>Test the complete path against real usage, edge cases, and dependable delivery.</p></div></li>
          </ol>
        </article>
        <aside className="project-system-stack" aria-label={`${project.title} technology stack`}>
          <header><Layers3 aria-hidden="true" /><span>Technology stack</span></header>
          <strong>{String(tech.length).padStart(2, '0')}<small>connected tools</small></strong>
          <ul>{tech.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, '0')}</span>{item}</li>)}</ul>
        </aside>
        <article className="project-system-principles">
          <header><span>Engineering principles</span><b>Designed to hold up beyond the demo</b></header>
          <div><section><span>01</span><h3>Clarity first</h3><p>Technical depth becomes an interface people can confidently navigate.</p></section><section><span>02</span><h3>Systems thinking</h3><p>Product choices connect to dependable architecture and observable workflows.</p></section><section><span>03</span><h3>Built for reality</h3><p>The experience accounts for practical constraints, edge cases, and change.</p></section></div>
        </article>
      </div>
    </section>

    <section className="project-case-close">
      <div className="project-case-contact"><span>Have a complex product in mind?</span><h2>Let&apos;s make it<br /><em>clear, useful, and real.</em></h2><MagneticLink href="/contact" className="project-case-primary">Start a conversation <ArrowUpRight aria-hidden="true" /></MagneticLink></div>
      {nextProject && nextProject.id !== project.id ? <Link className="project-case-next" href={`/projects/${nextProject.slug}`}><span>Next case study <b>{String(position + 2 > projects.length ? 1 : position + 2).padStart(2, '0')}</b></span><div><p>{nextProject.category} · {nextProject.year}</p><h2>{nextProject.title}</h2></div><ArrowUpRight aria-hidden="true" /></Link> : null}
    </section>
    <SiteFooter />
  </main>;
}
