import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Box,
  Boxes,
  BrainCircuit,
  Cloud,
  Code2,
  Database,
  Layers3,
  Link2,
  Monitor,
  Plug,
  Search,
  Send,
  Sparkles,
  Target,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ProjectExplorer from './ProjectExplorer';
import { getProjects } from '@/lib/content';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Projects — Amit Kumar Portfolio',
  description: 'Case studies from Amit Kumar across full-stack web development, blockchain engineering, applied AI, cloud systems, and research products in Patna.',
  alternates: { canonical: '/projects' },
  openGraph: { title: 'Projects — Amit Kumar Portfolio', description: 'Full-stack, blockchain, AI, and research-led project case studies by Amit Kumar.', url: '/projects', images: [{ url: '/og-social.jpg', width: 1200, height: 630, alt: 'Selected projects by Amit Kumar' }] },
  twitter: { card: 'summary_large_image', title: 'Projects — Amit Kumar Portfolio', description: 'Full-stack, blockchain, AI, and research-led project case studies by Amit Kumar.', images: ['/og-social.jpg'] },
};

const workSteps = [
  { number: '1', title: 'Understand', description: 'Clarify goals, users, and constraints.', icon: Search },
  { number: '2', title: 'Engineer', description: 'Design robust systems and ship iteratively.', icon: Code2 },
  { number: '3', title: 'Deliver', description: 'Ensure quality, scalability, and long-term value.', icon: Send },
] satisfies Array<{ number: string; title: string; description: string; icon: LucideIcon }>;

const focusAreas = [
  { label: 'Full-stack', icon: Layers3 },
  { label: 'AI systems', icon: BrainCircuit },
  { label: 'Blockchain', icon: Link2 },
  { label: 'Cloud', icon: Cloud },
  { label: 'APIs', icon: Plug },
  { label: 'Architecture', icon: Box },
] satisfies Array<{ label: string; icon: LucideIcon }>;

const systemFlow = [
  { label: 'Interface', icon: Monitor },
  { label: 'Logic', icon: Code2 },
  { label: 'Services', icon: Boxes },
  { label: 'Data', icon: Database },
] satisfies Array<{ label: string; icon: LucideIcon }>;

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
            <Link href="/contact">Start a project <ArrowRight aria-hidden="true" /></Link>
            <p><span aria-hidden="true" /> Available for select collaborations</p>
          </div>
        </div>
      </section>

      <ProjectExplorer projects={projects} />

      <section className="projects-process" aria-label="Working approach">
        <aside className="projects-hero-dashboard" aria-label="How I work and areas of focus">
          <section className="projects-method-panel" aria-labelledby="projects-method-heading">
            <header>
              <h2 id="projects-method-heading">How I work</h2>
              <Sparkles aria-hidden="true" />
            </header>
            <ol>
              {workSteps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <li className="projects-method-step" key={step.number}>
                    <span className="projects-step-number">{step.number}</span>
                    <span className="projects-step-icon"><StepIcon aria-hidden="true" /></span>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </li>
                );
              })}
            </ol>
          </section>

          <div className="projects-dashboard-secondary">
            <section className="projects-focus-panel" aria-labelledby="projects-focus-heading">
              <header>
                <h2 id="projects-focus-heading">Core focus</h2>
                <Target aria-hidden="true" />
              </header>
              <ul>
                {focusAreas.map((area) => {
                  const FocusIcon = area.icon;
                  return <li key={area.label}><FocusIcon aria-hidden="true" /><span>{area.label}</span></li>;
                })}
              </ul>
            </section>

            <section className="projects-thinking-panel" aria-labelledby="projects-thinking-heading">
              <header>
                <h2 id="projects-thinking-heading">System thinking</h2>
                <Workflow aria-hidden="true" />
              </header>
              <ol>
                {systemFlow.map((item) => {
                  const FlowIcon = item.icon;
                  return (
                    <li key={item.label}>
                      <span><FlowIcon aria-hidden="true" /></span>
                      <b>{item.label}</b>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>
        </aside>
      </section>
      <SiteFooter />
    </main>
  );
}
