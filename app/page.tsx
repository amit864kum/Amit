import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const projects = [
  { number: '01', title: 'Sugarcane Supply Chain', type: 'Blockchain / Research', accent: 'from-[#d7a42c] to-[#74500a]' },
  { number: '02', title: 'PhotoFinder', type: 'AI / Full-stack platform', accent: 'from-[#6d73ff] to-[#292354]' },
  { number: '03', title: 'FedChain', type: 'Distributed systems / Research', accent: 'from-[#19bca7] to-[#113f50]' },
];
const services = [
  { number: '01', title: 'Full-Stack Product Development', description: 'Scalable applications built end to end with React, Next.js, Node.js, TypeScript, and PostgreSQL.', proof: 'Museiac · PhotoFinder' },
  { number: '02', title: 'Blockchain & Smart Contracts', description: 'Permissioned networks, Go chaincode, traceable workflows, and decentralized storage for real operational problems.', proof: 'Supply Chain · Land Registry' },
  { number: '03', title: 'AI & Distributed Systems', description: 'Privacy-aware intelligent platforms using facial recognition, federated learning, and peer-to-peer systems.', proof: 'PhotoFinder · FedChain' },
  { number: '04', title: 'Research & Institutional Platforms', description: 'Clear, responsive digital experiences for laboratories, departments, publications, and research infrastructure.', proof: 'IIT Patna · Academic Portals' },
  { number: '05', title: 'APIs, Cloud & Deployment', description: 'Secure REST APIs, WebSockets, containers, databases, and production delivery across modern cloud platforms.', proof: 'Docker · AWS · Cloudflare' },
];

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Available for select projects</p>
          <h1>I build digital<span className="serif-line">products with <em>purpose.</em></span></h1>
          <p className="intro">
            Full-stack developer and blockchain engineer crafting scalable,
            high-impact experiences where thoughtful design meets dependable code.
          </p>
          <div className="hero-actions">
            <Link href="/work" className="button button-primary">Explore my work <span>↗</span></Link>
            <a href="mailto:amitkumarabhinav59@gmail.com" className="text-link">amitkumarabhinav59@gmail.com</a>
          </div>
        </div>

        <div className="portrait-wrap" aria-label="Portrait of Amit Kumar">
          <div className="portrait-orbit orbit-one" />
          <div className="portrait-orbit orbit-two" />
          <div className="portrait-card">
            <Image src="/amit-kumar.jpeg" alt="Amit Kumar in a black suit" fill sizes="(max-width: 800px) 86vw, 36vw" priority />
          </div>
          <div className="experience-badge"><strong>6+</strong><span>Professional<br />builds shipped</span></div>
        </div>
      </section>

      <section className="what-i-do" aria-labelledby="what-i-do-heading">
        <div className="section-heading">
          <div><p className="eyebrow">What I do</p><h2 id="what-i-do-heading">Complex systems.<br /><em>Clear outcomes.</em></h2></div>
          <p>Capabilities grounded in shipped products, research work, and production engineering.</p>
        </div>
        <div className="service-list">
          {services.map((service) => (
            <article className="service-row" key={service.number}>
              <span>{service.number}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <small>{service.proof}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="selected-work" aria-labelledby="selected-work-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2 id="selected-work-heading">Built to solve.<br /><em>Designed to last.</em></h2>
          </div>
          <p>Research-led platforms, intelligent tools, and resilient digital infrastructure.</p>
        </div>

        <div className="project-grid">
          {projects.map((project) => (
            <Link href="/work" className="project-card" key={project.number}>
              <div className={`project-visual bg-gradient-to-br ${project.accent}`}>
                <span className="project-number">{project.number}</span>
                <span className="project-placeholder">Project imagery<br />managed in CMS</span>
                <span className="project-arrow">↗</span>
              </div>
              <p>{project.type}</p>
              <h3>{project.title}</h3>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
