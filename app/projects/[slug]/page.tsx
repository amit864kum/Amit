import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Code2, Layers3 } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import MagneticLink from '@/components/MagneticLink';
import ProjectCaseMediaMotion from '@/components/ProjectCaseMediaMotion';
import { getProject, getProjects } from '@/lib/content';
import { articleBlocks, blockSections } from '@/lib/blog';
import { projectDetails } from '@/lib/project-details';
import { decodePathSegment, toProjectSlug } from '@/lib/slug';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return { title: 'Project not found' };
  return {
    title: `${project.title} — Amit Kumar`, description: project.summary,
    alternates: { canonical: `/projects/${toProjectSlug(project.slug || project.title)}` },
    openGraph: { title: `${project.title} — Amit Kumar`, description: project.summary, images: project.imageUrl ? [{ url: project.imageUrl }] : [] },
    twitter: { card: 'summary_large_image', title: `${project.title} — Amit Kumar`, description: project.summary, images: project.imageUrl ? [project.imageUrl] : [] },
  };
}

function isGitHubUrl(value: string | null) {
  try { return Boolean(value && new URL(value).hostname.replace(/^www\./, '') === 'github.com'); }
  catch { return false; }
}

export default async function ProjectPage({ params }: Props) {
  const slug = decodePathSegment((await params).slug);
  const [project, projects] = await Promise.all([getProject(slug), getProjects()]);
  if (!project) notFound();
  const canonicalSlug = toProjectSlug(project.slug || project.title);
  if (slug !== canonicalSlug) redirect(`/projects/${canonicalSlug}`);

  const caseStudies = projects.filter((item) => item.destination === 'case_study');
  const position = Math.max(0, caseStudies.findIndex((item) => item.id === project.id));
  const nextProject = caseStudies.length ? caseStudies[(position + 1) % caseStudies.length] : null;
  const tech = project.tech.split(',').map((item) => item.trim()).filter(Boolean);
  const paragraphs = project.body.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
  const contentBlocks = project.contentJson ? articleBlocks(project.contentJson, '') : [];
  const contentSections = contentBlocks.length ? blockSections(contentBlocks) : [];
  const githubUrl = project.githubUrl || (isGitHubUrl(project.projectUrl) ? project.projectUrl : null);
  const liveUrl = project.projectUrl && !isGitHubUrl(project.projectUrl) ? project.projectUrl : null;
  const monogram = project.title.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  const details = projectDetails(project.detailJson);
  const systemSteps = details.systemSteps.filter((step) => step.label || step.title || step.description);
  const principles = details.principles.filter((principle) => principle.title || principle.description);

  return <main className={`inner-page project-case-page${project.imageUrl ? ' has-project-media' : ' project-case-text-only'}`}>
    <SiteHeader solid />
    <section className="project-case-hero" aria-labelledby="project-title">
      <div className="project-case-atmosphere" aria-hidden="true"><i /><i /><span>{monogram}</span></div>
      <Link className="project-case-back" href="/projects"><ArrowLeft aria-hidden="true" /> All projects</Link>
      <div className="project-case-hero-grid">
        <div className="project-case-intro">
          <div className="project-case-meta"><span>{project.category}</span><time dateTime={project.year}>{project.year}</time></div>
          <h1 id="project-title">{project.title}</h1><p className="project-case-deck">{project.summary}</p>
          {(liveUrl || githubUrl) ? <div className="project-case-actions">
            {liveUrl ? <a className="project-case-primary" href={liveUrl} target="_blank" rel="noreferrer">Visit live project <ArrowUpRight aria-hidden="true" /></a> : null}
            {githubUrl ? <a className="project-case-secondary" href={githubUrl} target="_blank" rel="noreferrer"><Code2 aria-hidden="true" /> View source</a> : null}
          </div> : null}
        </div>
        <aside className="project-case-hero-visual" aria-label={`${project.title} project overview`}>
          <header><span>AK / Project system</span><b>{project.year}</b></header>
          <div className="project-case-hero-mark" aria-hidden="true"><i /><i /><span>{monogram}</span></div>
          <footer><p>Built across</p><ul>{tech.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul></footer>
        </aside>
      </div>
    </section>

    {project.imageUrl ? <section className="project-case-showcase" aria-label={`${project.title} project media`}>
      <header><div><span>Interface view</span><p>Project imagery</p></div><small>{project.category} / {project.year}</small></header>
      <ProjectCaseMediaMotion><figure className="project-case-browser"><div className="project-case-browser-bar" aria-hidden="true"><span><i /><i /><i /></span><b>{project.title.toLowerCase().replaceAll(' ', '-')}.project</b><em>AK</em></div><div className="project-case-image"><Image src={project.imageUrl} alt={`${project.title} project interface`} fill sizes="(max-width: 800px) 94vw, 88vw" priority /></div></figure></ProjectCaseMediaMotion>
    </section> : null}

    <section className="project-case-story" id="project-story">
      <aside><span>01 / Context</span>{details.contextHeading || details.contextAccent ? <h2>{details.contextHeading}{details.contextHeading && details.contextAccent ? <br /> : null}{details.contextAccent ? <em>{details.contextAccent}</em> : null}</h2> : null}{details.contextDescription ? <p>{details.contextDescription}</p> : null}</aside>
      <article><p className="project-case-lead">{project.summary}</p><div className="project-case-prose">{paragraphs.map((paragraph, index) => <p key={`${project.id}-${index}`}>{paragraph}</p>)}</div>{details.designIntent ? <blockquote><span>Design intent</span><p>{details.designIntent}</p></blockquote> : null}</article>
    </section>

    {contentSections.length ? <section className="project-case-walkthrough" aria-labelledby={details.walkthroughHeading || details.walkthroughAccent ? 'walkthrough-title' : undefined} aria-label={details.walkthroughHeading || details.walkthroughAccent ? undefined : 'Project walkthrough'}>
      <header><div><span>02 / Walkthrough</span>{details.walkthroughHeading || details.walkthroughAccent ? <h2 id="walkthrough-title">{details.walkthroughHeading}{details.walkthroughHeading && details.walkthroughAccent ? <br /> : null}{details.walkthroughAccent ? <em>{details.walkthroughAccent}</em> : null}</h2> : null}</div>{details.walkthroughDescription ? <p>{details.walkthroughDescription}</p> : null}</header>
      <div className="project-walkthrough-sections">{contentSections.map((section, sectionIndex) => <article key={`${section.id}-${sectionIndex}`}>
        <header><span>{String(sectionIndex + 1).padStart(2, '0')}</span><h3>{section.heading}</h3></header>
        <div className="project-walkthrough-flow">{section.blocks.map((block) => {
          if (block.type === 'paragraph') return <p key={block.id}>{block.text}</p>;
          if (block.type === 'image' && block.imageUrl) return <figure key={block.id}>{block.imageHeading ? <h4>{block.imageHeading}</h4> : null}<div className="project-walkthrough-image"><Image src={block.imageUrl} alt={block.alt || `${project.title} project screenshot`} fill sizes="(max-width: 800px) 94vw, (max-width: 1600px) 88vw, 1500px" loading="lazy" /></div>{block.imageDescription ? <figcaption>{block.imageDescription}</figcaption> : null}</figure>;
          return null;
        })}</div>
      </article>)}</div>
    </section> : null}

    <section className="project-case-system" aria-labelledby={details.systemHeading || details.systemAccent ? 'system-title' : undefined} aria-label={details.systemHeading || details.systemAccent ? undefined : 'Project system'}>
      <header className="project-system-heading">
        <div className="project-system-kicker"><span>{contentSections.length ? '03' : '02'}</span><b>System</b></div>
        <div>{details.systemHeading || details.systemAccent ? <h2 id="system-title">{details.systemHeading}{details.systemHeading && details.systemAccent ? <br /> : null}{details.systemAccent ? <em>{details.systemAccent}</em> : null}</h2> : null}</div>
        {details.systemDescription ? <p>{details.systemDescription}</p> : null}
      </header>
      <div className={`project-system-blueprint${systemSteps.length ? '' : ' is-stack-only'}`}>
        {systemSteps.length ? <article className="project-system-path">
          <header><div><span>Delivery architecture</span><p>From foundation to finished experience</p></div><b>{monogram} / System map</b></header>
          <ol>{systemSteps.map((step, index) => <li key={`${step.label}-${index}`}>
            <div className="project-system-node"><span>{String(index + 1).padStart(2, '0')}</span><i aria-hidden="true" /></div>
            <div className="project-system-step-copy">{step.label ? <small>{step.label}</small> : null}{step.title ? <h3>{step.title}</h3> : null}{step.description ? <p>{step.description}</p> : null}</div>
          </li>)}</ol>
        </article> : null}
        <aside className="project-system-stack" aria-label={`${project.title} technology stack`}>
          <header><div><Layers3 aria-hidden="true" /><span>Technology stack</span></div><b>{String(tech.length).padStart(2, '0')}</b></header>
          <p>Tools connected across the build.</p>
          <ul>{tech.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, '0')}</span><b>{item}</b></li>)}</ul>
        </aside>
        {principles.length ? <article className="project-system-principles">
          <header><div><span>Engineering principles</span><p>Decisions that keep the system dependable.</p></div><b>Built beyond the demo</b></header>
          <div>{principles.map((principle, index) => <section key={`${principle.title}-${index}`}><div><span>{String(index + 1).padStart(2, '0')}</span><i aria-hidden="true" /></div>{principle.title ? <h3>{principle.title}</h3> : null}{principle.description ? <p>{principle.description}</p> : null}</section>)}</div>
        </article> : null}
      </div>
    </section>

    <section className="project-case-close">
      {details.ctaHeading || details.ctaAccent ? <div className="project-case-contact">{details.ctaEyebrow ? <span>{details.ctaEyebrow}</span> : null}<h2>{details.ctaHeading}{details.ctaHeading && details.ctaAccent ? <br /> : null}{details.ctaAccent ? <em>{details.ctaAccent}</em> : null}</h2><MagneticLink href="/contact" className="project-case-primary">Start a conversation <ArrowUpRight aria-hidden="true" /></MagneticLink></div> : null}
      {nextProject && nextProject.id !== project.id ? <Link className="project-case-next" href={`/projects/${toProjectSlug(nextProject.slug || nextProject.title)}`}><span>Next case study <b>{String(position + 2 > caseStudies.length ? 1 : position + 2).padStart(2, '0')}</b></span><div><p>{nextProject.category} · {nextProject.year}</p><h2>{nextProject.title}</h2></div><ArrowUpRight aria-hidden="true" /></Link> : null}
    </section>
    <SiteFooter />
  </main>;
}
