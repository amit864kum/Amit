import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Project } from '@/lib/content';
import { toProjectSlug } from '@/lib/slug';

function ProjectArtwork({ project, index }: { project: Project; index: number }) {
  const monogram = project.title.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  return <div className={`project-showcase-art tone-${(index % 3) + 1}`}>
    {project.imageUrl ? <Image src={project.imageUrl} alt={`${project.title} project preview`} fill sizes="(max-width: 640px) 92vw, (max-width: 1020px) 44vw, (max-width: 1380px) 30vw, 22vw" /> : <div className="project-showcase-monogram"><span>{monogram}</span><i /></div>}
  </div>;
}

export default function ProjectExplorer({ projects }: { projects: Project[] }) {
  return <section className="project-showcase" aria-labelledby="projects-showcase-title">
    <header className="project-showcase-heading">
      <div className="project-showcase-heading-main">
        <p><span aria-hidden="true" />Case studies</p>
        <h2 id="projects-showcase-title">Selected <em>projects</em></h2>
        <i aria-hidden="true" />
        <p>A selection of research-backed systems and digital products I&apos;ve designed and built to solve meaningful problems and deliver measurable impact.</p>
      </div>
      <p className="project-showcase-heading-note">Building secure, scalable, and intuitive solutions across blockchain, AI/ML, and data-driven platforms.</p>
      <div className="project-showcase-orbit" aria-hidden="true"><Sparkles /><i /><b /></div>
    </header>

    <div className="project-showcase-grid">
      {projects.map((project, index) => {
        const tech = project.tech.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 3);
        const external = project.destination !== 'case_study';
        const href = project.destination === 'live' ? project.projectUrl : project.destination === 'github' ? project.githubUrl : `/projects/${toProjectSlug(project.slug || project.title)}`;
        return <article className="project-showcase-card" key={project.id}>
          <Link href={href || '#'} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} aria-label={`${external ? 'Open' : 'View'} ${project.title} project`}>
            <header className="project-showcase-meta">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <b aria-hidden="true" />
              <p>{project.category}</p>
              <time dateTime={project.year}>{project.year}</time>
            </header>
            <ProjectArtwork project={project} index={index} />
            <div className="project-showcase-copy">
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <ul aria-label={`${project.title} technologies`}>{tech.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <footer><span>{project.destination === 'live' ? 'Visit live project' : project.destination === 'github' ? 'View on GitHub' : 'View project'}</span><ArrowRight aria-hidden="true" /></footer>
          </Link>
        </article>;
      })}
    </div>
    {!projects.length ? <p className="project-showcase-empty">Projects will appear here soon.</p> : null}
  </section>;
}
