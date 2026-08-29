import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ScrollScene from '@/components/ScrollScene';
import MagneticLink from '@/components/MagneticLink';
import ScrollTicker from '@/components/ScrollTicker';

const projects = [
  { number: '01', slug: 'sugarcane-supply-chain', title: 'Sugarcane Supply Chain', type: 'Blockchain / Research' },
  { number: '02', slug: 'photo-finder', title: 'PhotoFinder', type: 'AI / Full-stack platform' },
  { number: '03', slug: 'fedchain', title: 'FedChain', type: 'Distributed systems / Research' },
];
const services = [
  { number: '01', title: 'Full-Stack Product Development', description: 'I turn product ideas into responsive, scalable web applications—from interface architecture to production-ready APIs.', proof: 'Museiac · PhotoFinder', skills: ['Product UI', 'Backend APIs', 'Databases'] },
  { number: '02', title: 'Blockchain Systems', description: 'I build permissioned networks, smart-contract workflows, and traceable platforms for real operational challenges.', proof: 'Supply Chain · Land Registry', skills: ['Hyperledger', 'Go chaincode', 'IPFS'] },
  { number: '03', title: 'AI & Distributed Intelligence', description: 'I develop privacy-aware intelligent systems using computer vision, federated learning, and peer-to-peer coordination.', proof: 'PhotoFinder · FedChain', skills: ['AI vision', 'FedAvg', 'P2P systems'] },
  { number: '04', title: 'Research Platforms', description: 'I translate complex academic work into clear digital platforms for laboratories, publications, people, and infrastructure.', proof: 'IIT Patna · Research portals', skills: ['Information design', 'Next.js', 'Deployment'] },
  { number: '05', title: 'Cloud & Production Engineering', description: 'I ship dependable software with secure APIs, real-time communication, containers, and modern cloud infrastructure.', proof: 'Docker · AWS · Cloudflare', skills: ['REST APIs', 'WebSockets', 'CI-ready builds'] },
];
const stackLayers = [
  { label: 'Experience layer', number: '01', description: 'Fast, accessible interfaces shaped around real user journeys.', tools: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'] },
  { label: 'Application layer', number: '02', description: 'Typed services, real-time flows, and dependable data foundations.', tools: ['Node.js', 'Express.js', 'REST APIs', 'WebSockets', 'PostgreSQL'] },
  { label: 'Intelligence & trust', number: '03', description: 'Applied AI and verifiable systems for complex product challenges.', tools: ['Python', 'PyTorch', 'Hyperledger Fabric', 'Go', 'IPFS'] },
  { label: 'Delivery layer', number: '04', description: 'Portable, observable software ready for production environments.', tools: ['Docker', 'AWS', 'Cloudflare', 'GitHub'] },
];

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <ScrollScene className="hero home-hero-scene">
        <div className="hero-atmosphere" aria-hidden="true"><i /><i /><i /></div>
        <div className="hero-copy">
          <h1>I build digital<span className="serif-line">products with <em>purpose.</em></span></h1>
          <p className="intro">
            Full-stack developer and blockchain engineer crafting scalable,
            high-impact experiences where thoughtful design meets dependable code.
          </p>
          <div className="hero-actions">
            <MagneticLink href="/work" className="button button-primary">Explore my work <span>↗</span></MagneticLink>
            <a href="mailto:amitkumarabhinav59@gmail.com" className="text-link">amitkumarabhinav59@gmail.com</a>
          </div>
          <div className="hero-proof" aria-label="Professional highlights"><p><strong>06+</strong><span>Products and research<br />platforms shipped</span></p><p><strong>04</strong><span>Engineering<br />disciplines</span></p><p><strong>IIT</strong><span>Patna research<br />experience</span></p></div>
        </div>

        <div className="portrait-wrap" aria-label="Portrait of Amit Kumar">
          <div className="portrait-orbit orbit-one" />
          <div className="portrait-orbit orbit-two" />
          <div className="portrait-card">
            <Image src="/amit-kumar.jpeg" alt="Amit Kumar in a black suit" fill sizes="(max-width: 800px) 86vw, 36vw" priority />
          </div>
          <div className="portrait-glass-note"><span>Current focus</span><strong>Building products<br />that earn trust.</strong></div>
          <div className="portrait-role" aria-hidden="true"><span>Full-stack</span><span>Blockchain</span><span>Applied AI</span></div>
          <div className="experience-badge"><strong>6+</strong><span>Professional<br />builds shipped</span></div>
        </div>
      </ScrollScene>

      <ScrollTicker items={['Full-stack systems', 'Blockchain products', 'Applied AI', 'Product experience', 'Cloud delivery']} />

      <section className="what-i-do" aria-labelledby="what-i-do-heading">
        <div className="what-i-do-intro">
          <p className="eyebrow">What I do</p>
          <h2 id="what-i-do-heading">Ideas in.<br /><em>Impact out.</em></h2>
          <p>I work at the intersection of product thinking, emerging technology, and reliable engineering.</p>
          <Link href="/work" className="read-link">See the work behind it ↗</Link>
        </div>
        <div className="service-grid">
          {services.map((service, index) => (
            <article className={`service-card service-card-${index + 1} ${index === 0 ? 'service-card-featured' : ''}`} key={service.number}>
              <header><span>{service.number}</span><small>{service.proof}</small></header>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <div>{service.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="tech-stack" aria-labelledby="tech-stack-heading">
        <div className="tech-stack-heading">
          <div><p className="eyebrow">Technology stack</p><h2 id="tech-stack-heading">Built in layers.<br /><em>Shipped as one.</em></h2></div>
          <div className="stack-principle"><span>Principle 01</span><p>Technology is a means to a clear, dependable product—not the headline.</p></div>
        </div>
        <div className="stack-architecture">
          <div className="stack-blueprint" aria-hidden="true">
            <span>Product architecture</span>
            <div><i /><i /><i /><i /></div>
            <strong>Ideas become<br />working systems.</strong>
            <small>Interface → Infrastructure</small>
          </div>
          <div className="stack-layers">
            {stackLayers.map((layer) => (
              <article className="stack-layer" key={layer.label}>
                <span>{layer.number}</span>
                <div><h3>{layer.label}</h3><p>{layer.description}</p></div>
                <ul>{layer.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
        <div className="stack-footer"><p><span /> Production-minded by default</p><Link href="/about">Explore my technical background ↗</Link></div>
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
            <Link href={`/work/${project.slug}`} className="project-card" key={project.number}>
              <div className="project-visual">
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
