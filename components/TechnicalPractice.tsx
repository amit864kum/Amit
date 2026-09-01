'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { Boxes, Cloud, Compass, ShieldCheck } from 'lucide-react';
import { FaAws } from 'react-icons/fa';
import { SiDocker, SiGit, SiMongodb, SiNextdotjs, SiPostgresql, SiPytorch, SiTypescript } from 'react-icons/si';

const disciplines = [
  { number: '01', title: 'Build', Icon: Boxes, statement: 'Product engineering from interface to database.', tools: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'] },
  { number: '02', title: 'Explore', Icon: Compass, statement: 'Research-led systems that test ambitious ideas.', tools: ['Python', 'PyTorch', 'Federated Learning', 'Computer Vision', 'P2P'] },
  { number: '03', title: 'Trust', Icon: ShieldCheck, statement: 'Traceable infrastructure for high-stakes workflows.', tools: ['Hyperledger Fabric', 'Go', 'CouchDB', 'IPFS', 'Smart Contracts'] },
  { number: '04', title: 'Ship', Icon: Cloud, statement: 'Reliable delivery across modern cloud environments.', tools: ['Docker', 'AWS', 'Cloudflare', 'Git', 'GitHub'] },
];

const coreTechnologies = [
  { name: 'Next.js', Icon: SiNextdotjs, tone: 'next' },
  { name: 'TypeScript', Icon: SiTypescript, tone: 'typescript' },
  { name: 'PyTorch', Icon: SiPytorch, tone: 'pytorch' },
  { name: 'Docker', Icon: SiDocker, tone: 'docker' },
  { name: 'MongoDB', Icon: SiMongodb, tone: 'mongodb' },
  { name: 'PostgreSQL', Icon: SiPostgresql, tone: 'postgresql' },
  { name: 'AWS', Icon: FaAws, tone: 'aws' },
  { name: 'Git', Icon: SiGit, tone: 'git' },
];

function CardArtwork({ title, reduceMotion }: { title: string; reduceMotion: boolean | null }) {
  if (title === 'Explore') {
    return (
      <motion.div className="discipline-orbits" aria-hidden="true" initial={reduceMotion ? false : { opacity: 0, scale: .72, rotate: -24 }} whileInView={{ opacity: 1, scale: 1, rotate: 0 }} viewport={{ once: true, amount: .6 }} transition={{ duration: .9, delay: .22, ease: [0.22, 1, 0.36, 1] }}>
        <i /><i /><i /><i />
        <span className="orbit-core" />
        <b /><b /><b /><b />
      </motion.div>
    );
  }

  if (title === 'Trust') {
    return (
      <motion.div className="discipline-waves" aria-hidden="true" initial={reduceMotion ? false : { opacity: 0, x: 46 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .6 }} transition={{ duration: .86, delay: .28, ease: [0.22, 1, 0.36, 1] }}>
        {Array.from({ length: 7 }, (_, index) => <i key={index} />)}
      </motion.div>
    );
  }

  return (
    <motion.div className="discipline-layers" aria-hidden="true" initial={reduceMotion ? false : { opacity: 0, x: 54, y: 18 }} whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: true, amount: .6 }} transition={{ duration: .9, delay: .24, ease: [0.22, 1, 0.36, 1] }}>
      <i /><i /><i />
    </motion.div>
  );
}

export default function TechnicalPractice() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="about-toolkit" aria-labelledby="about-toolkit-heading">
      <div className="about-toolkit-grid" aria-hidden="true" />
      <motion.div
        className="about-toolkit-heading"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: .45 }}
        transition={{ duration: .72, ease: [0.22, 1, 0.36, 1] }}
      >
        <div><p className="eyebrow"><i />Technical practice</p><h2 id="about-toolkit-heading">A toolkit shaped by<br /><em>what the work demands.</em></h2></div>
        <p>I move comfortably between product engineering, applied research, distributed trust, and production delivery.</p>
      </motion.div>

      <div className="discipline-grid">
        {disciplines.map(({ Icon, ...discipline }, index) => (
          <motion.article
            className={`discipline-card discipline-card-${discipline.title.toLowerCase()}`}
            key={discipline.title}
            initial={reduceMotion ? false : { opacity: 0, y: 62, scale: .965, rotateX: 8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            whileHover={reduceMotion ? undefined : { y: -7, scale: 1.01 }}
            viewport={{ once: true, amount: .22 }}
            transition={{ type: 'spring', stiffness: 132, damping: 18, mass: .82, delay: index * .065 }}
          >
            <span className="discipline-icon"><Icon aria-hidden="true" /></span>
            <div className="discipline-copy"><span>{discipline.number}</span><h3>{discipline.title}</h3><i /><p>{discipline.statement}</p></div>
            <ul>{discipline.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
            <CardArtwork title={discipline.title} reduceMotion={reduceMotion} />
            {discipline.title === 'Build' ? <div className="discipline-dot-field" aria-hidden="true" /> : null}
          </motion.article>
        ))}
      </div>

      <motion.div
        className="toolkit-marquee"
        aria-label="Core technologies"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: .4 }}
        transition={{ duration: .7, ease: [0.22, 1, 0.36, 1] }}
      >
        <strong>Core<br />technologies</strong>
        {coreTechnologies.map(({ name, Icon, tone }, index) => (
          <motion.div key={name} whileHover={reduceMotion ? undefined : { y: -4 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }}>
            <span className="technology-brand" data-tone={tone}><Icon aria-hidden="true" /></span>
            <b>{name}</b>
            <i aria-hidden="true" style={{ '--technology-index': index } as CSSProperties} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
