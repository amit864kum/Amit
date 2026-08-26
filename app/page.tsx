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
  { number: '01', title: 'Full-Stack Product Development', description: 'I turn product ideas into responsive, scalable web applications—from interface architecture to production-ready APIs.', proof: 'Museiac · PhotoFinder', skills: ['Product UI', 'Backend APIs', 'Databases'] },
  { number: '02', title: 'Blockchain Systems', description: 'I build permissioned networks, smart-contract workflows, and traceable platforms for real operational challenges.', proof: 'Supply Chain · Land Registry', skills: ['Hyperledger', 'Go chaincode', 'IPFS'] },
  { number: '03', title: 'AI & Distributed Intelligence', description: 'I develop privacy-aware intelligent systems using computer vision, federated learning, and peer-to-peer coordination.', proof: 'PhotoFinder · FedChain', skills: ['AI vision', 'FedAvg', 'P2P systems'] },
  { number: '04', title: 'Research Platforms', description: 'I translate complex academic work into clear digital platforms for laboratories, publications, people, and infrastructure.', proof: 'IIT Patna · Research portals', skills: ['Information design', 'Next.js', 'Deployment'] },
  { number: '05', title: 'Cloud & Production Engineering', description: 'I ship dependable software with secure APIs, real-time communication, containers, and modern cloud infrastructure.', proof: 'Docker · AWS · Cloudflare', skills: ['REST APIs', 'WebSockets', 'CI-ready builds'] },
];
const stackGroups = [
  { label: 'Frontend', number: '01', tools: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS'] },
  { label: 'Backend & Data', number: '02', tools: ['Node.js', 'Express.js', 'REST APIs', 'WebSockets', 'PostgreSQL', 'CouchDB'] },
  { label: 'Blockchain', number: '03', tools: ['Hyperledger Fabric', 'Go', 'Smart Contracts', 'IPFS'] },
  { label: 'AI & Research', number: '04', tools: ['Python', 'PyTorch', 'Federated Learning', 'Computer Vision', 'P2P Networking'] },
  { label: 'Cloud & Tools', number: '05', tools: ['Docker', 'AWS', 'Cloudflare', 'Git', 'GitHub'] },
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
        <div className="what-i-do-intro">
          <p className="eyebrow">What I do</p>
          <h2 id="what-i-do-heading">Ideas in.<br /><em>Impact out.</em></h2>
          <p>I work at the intersection of product thinking, emerging technology, and reliable engineering.</p>
          <Link href="/work" className="read-link">See the work behind it ↗</Link>
        </div>
        <div className="service-grid">
          {services.map((service, index) => (
            <article className={'service-card ' + (index === 0 ? 'service-card-featured' : '')} key={service.number}>
              <header><span>{service.number}</span><small>{service.proof}</small></header>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <div>{service.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="tech-stack" aria-labelledby="tech-stack-heading">
        <div className="section-heading">
          <div><p className="eyebrow">Technology stack</p><h2 id="tech-stack-heading">The tools behind<br /><em>the outcomes.</em></h2></div>
          <p>A practical stack selected for performance, scalability, security, and maintainability.</p>
        </div>
        <div className="stack-layout">
          <div className="stack-statement" aria-hidden="true"><span>From</span><strong>01</strong><i>idea</i><span>to</span><strong>05</strong><i>production</i></div>
          <div className="stack-groups">
            {stackGroups.map((group) => (
              <article className="stack-group" key={group.label}>
                <header><span>{group.number}</span><h3>{group.label}</h3></header>
                <div>{group.tools.map((tool) => <span key={tool}>{tool}</span>)}</div>
              </article>
            ))}
          </div>
        </div>
        <p className="stack-footnote"><span /> Continuously learning, deliberately choosing, and shipping with the right technology for each product.</p>
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
