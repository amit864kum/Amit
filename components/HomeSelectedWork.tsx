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

const projects = [
  {
    number: '01',
    slug: 'sugarcane-supply-chain',
    title: 'Sugarcane Supply Chain',
    description: 'A blockchain-backed supply-chain platform designed for traceable records, accountable workflows, and dependable transfers.',
    tags: ['Blockchain', 'Full-stack', 'Research'],
    status: 'Case study',
    impact: 'Traceability, accountability, tamper-resistant records',
    progress: '100%',
    visual: 'chain',
  },
  {
    number: '02',
    slug: 'photo-finder',
    title: 'PhotoFinder',
    description: 'Intelligent visual search and distributed image discovery powered by computer vision and peer-to-peer coordination.',
    tags: ['AI', 'Computer Vision', 'P2P'],
    status: 'AI prototype',
    impact: 'Faster discovery across distributed media',
    progress: '92%',
    visual: 'search',
  },
  {
    number: '03',
    slug: 'fedchain',
    title: 'FedChain',
    description: 'A privacy-aware federated learning system with blockchain trust for model integrity and verifiable collaboration.',
    tags: ['AI', 'Distributed Systems', 'Applied Research'],
    status: 'Research',
    impact: 'Privacy, security, and model integrity',
    progress: '78%',
    visual: 'federated',
  },
];

function ProjectVisual({ type, title }: { type: string; title: string }) {
  const src = type === 'chain'
    ? '/featured-work/sugarcane-supply-chain.png'
    : type === 'search'
      ? '/featured-work/photo-finder.png'
      : '/featured-work/fedchain.png';
  return (
    <div className={`hsw-visual hsw-${type}-visual`}>
      <Image src={src} alt={`${title} project visualization`} fill sizes="(max-width: 760px) 92vw, (max-width: 1180px) 86vw, 48vw" />
      <i aria-hidden="true" />
    </div>
  );
}

export default function HomeSelectedWork() {
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
          {projects.map((project, index) => (
            <motion.article className={`hsw-card hsw-card-${index + 1}`} key={project.number} {...reveal} transition={reduceMotion ? undefined : { duration: .75, delay: index * .08, ease: [0.22, 1, 0.36, 1] }}>
              <Link href={`/projects/${project.slug}`} aria-label={`View ${project.title} project`}>
                <div className="hsw-card-copy">
                  <span className="hsw-number">{project.number}</span>
                  <span className="hsw-status"><i aria-hidden="true" />{project.status}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <ul>{project.tags.map((tag) => <li key={tag}><Blocks aria-hidden="true" />{tag}</li>)}</ul>
                </div>
                <ProjectVisual type={project.visual} title={project.title} />
                <footer>
                  <span className="hsw-impact-icon"><ChartNoAxesCombined aria-hidden="true" /></span>
                  <p><strong>Impact</strong><span>{project.impact}</span></p>
                  <div className="hsw-progress"><span>Project progress <strong>{project.progress}</strong></span><i><b style={{ width: project.progress }} /></i></div>
                </footer>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
      <div className="hsw-closing-line"><span aria-hidden="true" /><Sparkles aria-hidden="true" /><p>Designed for impact. Built for scale. Ready for what&apos;s next.</p><Sparkles aria-hidden="true" /><span aria-hidden="true" /></div>
    </section>
  );
}
