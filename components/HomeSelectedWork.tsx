'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Blocks,
  Box,
  ChartNoAxesCombined,
  Rocket,
  Sparkles,
  Target,
} from 'lucide-react';
import type { Project } from '@/lib/content';
import { toProjectSlug } from '@/lib/slug';

const projectMeta: Record<string, { impact: string; progress: string; visual: string }> = {
  'sugarcane-supply-chain': { impact: 'Traceability, accountability, tamper-resistant records', progress: '100%', visual: 'chain' },
  'photo-finder': { impact: 'Faster discovery across distributed media', progress: '92%', visual: 'search' },
  fedchain: { impact: 'Privacy, security, and model integrity', progress: '78%', visual: 'federated' },
};

function ProjectVisual({ type, title, imageUrl }: { type: string; title: string; imageUrl: string | null }) {
  const fallback = type === 'chain'
    ? '/featured-work/sugarcane-supply-chain.png'
    : type === 'search'
      ? '/featured-work/photo-finder.png'
      : '/featured-work/fedchain.png';
  return (
    <div className={`hsw-visual hsw-${type}-visual`}>
      <Image src={imageUrl || fallback} alt={`${title} project visualization`} fill sizes="(max-width: 760px) 92vw, (max-width: 1180px) 86vw, 48vw" />
      <i aria-hidden="true" />
    </div>
  );
}

export default function HomeSelectedWork({ projects }: { projects: Project[] }) {
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion ? {} : {
    initial: { opacity: 0, y: 36 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: .18 },
    transition: { duration: .75, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  };

  return (
    <section className="home-selected-work" aria-labelledby="selected-work-heading">
      <div className="hsw-atmosphere" aria-hidden="true"><i /><i /><i /></div>
      <div className="hsw-layout">
        <motion.aside className="hsw-intro" {...reveal}>
          <p className="hsw-kicker"><span aria-hidden="true" />Selected work / Home</p>
          <h2 id="selected-work-heading">Featured <Sparkles aria-hidden="true" /><em>Projects</em></h2>
          <i className="hsw-heading-rule" aria-hidden="true" />
          <p className="hsw-intro-copy">A curated selection of systems I&apos;ve designed and built across full-stack engineering, blockchain, applied AI, and product experience.</p>
          <Link className="hsw-all-link" href="/projects"><span>View all projects</span><i aria-hidden="true"><ArrowRight /></i></Link>
          <div className="hsw-principles" aria-label="Work principles">
            <p><Box aria-hidden="true" /><span>End-to-end<br />ownership</span></p>
            <p><Target aria-hidden="true" /><span>Impact<br />focused</span></p>
            <p><Rocket aria-hidden="true" /><span>Research<br />driven</span></p>
          </div>
          <blockquote><Sparkles aria-hidden="true" /><p>“I build digital products<br />that earn trust.”</p></blockquote>
        </motion.aside>

        <div className="hsw-bento">
          {projects.map((project, index) => {
            const slug = toProjectSlug(project.slug || project.title);
            const meta = projectMeta[slug] || { impact: 'Reliable delivery and measurable product value', progress: '100%', visual: ['chain', 'search', 'federated'][index % 3] };
            const external = project.destination !== 'case_study';
            const href = project.destination === 'live' ? project.projectUrl : project.destination === 'github' ? project.githubUrl : `/projects/${slug}`;
            const tags = project.tech.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 3);
            return <motion.article className={`hsw-card hsw-card-${index + 1}`} key={project.id} {...reveal} transition={reduceMotion ? undefined : { duration: .75, delay: index * .08, ease: [0.22, 1, 0.36, 1] }}>
              <Link href={href || '#'} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} aria-label={`${external ? 'Open' : 'View'} ${project.title} project`}>
                <div className="hsw-card-copy">
                  <span className="hsw-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="hsw-status"><i aria-hidden="true" /><span>{project.category}</span></span>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <ul>{tags.map((tag) => <li key={tag}><Blocks aria-hidden="true" />{tag}</li>)}</ul>
                </div>
                <ProjectVisual type={meta.visual} title={project.title} imageUrl={project.imageUrl} />
                <footer>
                  <span className="hsw-impact-icon"><ChartNoAxesCombined aria-hidden="true" /></span>
                  <p><strong>Impact</strong><span>{meta.impact}</span></p>
                  <div className="hsw-progress"><span>Project progress <strong>{meta.progress}</strong></span><i><b style={{ width: meta.progress }} /></i></div>
                </footer>
              </Link>
            </motion.article>;
          })}
        </div>
      </div>
      <div className="hsw-closing-line"><span aria-hidden="true" /><Sparkles aria-hidden="true" /><p>Designed for impact. Built for scale. Ready for what&apos;s next.</p><Sparkles aria-hidden="true" /><span aria-hidden="true" /></div>
    </section>
  );
}
