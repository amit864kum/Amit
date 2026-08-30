import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/lib/content';

function ProjectArtwork({ project, index }: { project: Project; index: number }) {
  const monogram = project.title.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  return <div className={`project-showcase-art tone-${(index % 3) + 1}`}>
    {project.imageUrl ? <Image src={project.imageUrl} alt="" fill sizes="(max-width: 760px) 100vw, 58vw" /> : <div className="project-showcase-monogram"><span>{monogram}</span><i /></div>}
    <div className="project-showcase-art-top"><span>{String(index + 1).padStart(2, '0')}</span><b>{project.year}</b></div>
  </div>;
}

export default function ProjectExplorer({ projects }: { projects: Project[] }) {
  return <section className="project-showcase" aria-labelledby="projects-showcase-title">
    <header className="project-showcase-heading">
      <div>
        <p>Case studies</p>
        <h2 id="projects-showcase-title">Selected <em>projects</em></h2>
      </div>
      <div className="project-showcase-heading-note">
        <span>{String(projects.length).padStart(2, '0')} / total</span>
        <p>Research-led systems and digital products shaped around meaningful problems, clear decisions, and dependable outcomes.</p>
      </div>
    </header>

    <div className="project-showcase-grid">
      {projects.map((project, index) => {
        const tech = project.tech.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 3);
        return <article className="project-showcase-card" key={project.id}>
          <Link href={`/projects/${project.slug}`}>
            <ProjectArtwork project={project} index={index} />
            <div className="project-showcase-copy">
              <div className="project-showcase-meta"><span>{project.category}</span><time>{project.year}</time></div>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <footer>
                <ul>{tech.map((item) => <li key={item}>{item}</li>)}</ul>
                <span>View case study <ArrowUpRight aria-hidden="true" /></span>
              </footer>
            </div>
          </Link>
        </article>;
      })}
    </div>
    {!projects.length ? <p className="project-showcase-empty">Projects will appear here soon.</p> : null}
  </section>;
}
