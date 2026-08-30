import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ProjectExplorer from './ProjectExplorer';
import { getProjects } from '@/lib/content';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Projects — Amit Kumar',
  description: 'Selected full-stack, AI, blockchain, and research projects by Amit Kumar.',
  alternates: { canonical: '/projects' },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <main className="inner-page projects-index-page">
      <SiteHeader solid />
      <section className="projects-hero" aria-labelledby="projects-heading">
        <div className="projects-hero-copy">
          <h1 id="projects-heading">
            <span>Complex systems.</span>
            <em>Clear outcomes.</em>
          </h1>
          <p className="projects-hero-intro">I design and build dependable digital products across full-stack engineering, applied AI, blockchain, and distributed systems.</p>
          <div className="projects-hero-actions">
            <Link href="/contact">Start a project <ArrowUpRight aria-hidden="true" /></Link>
            <p><span aria-hidden="true" /> Available for select collaborations</p>
          </div>
        </div>
        <aside className="projects-hero-system" aria-hidden="true">
          <div className="projects-system-heading"><span>Working method</span><b>01—03</b></div>
          <div className="projects-system-statement">
            <p>From first principle to production</p>
            <strong>Think.<br />Build.<br /><em>Deliver.</em></strong>
          </div>
          <ol className="projects-system-steps">
            <li><span>01</span><b>Understand</b></li>
            <li><span>02</span><b>Engineer</b></li>
            <li><span>03</span><b>Deliver</b></li>
          </ol>
          <div className="projects-system-footer"><span>AK / Systems</span><span>Built for real use</span></div>
        </aside>
      </section>
      <ProjectExplorer projects={projects} />
      <SiteFooter />
    </main>
  );
}
