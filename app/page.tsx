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
const stackCards = [
  { mark: 'UI', label: 'Frontend systems', description: 'Responsive, accessible product interfaces with strong component architecture.', tools: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'], size: 'wide' },
  { mark: 'API', label: 'Backend & data', description: 'Secure services, real-time communication, and reliable data models.', tools: ['Node.js', 'Express.js', 'WebSockets', 'PostgreSQL'], size: 'standard' },
  { mark: 'AI', label: 'Applied intelligence', description: 'Research-led machine learning for private, useful experiences.', tools: ['Python', 'PyTorch', 'Computer Vision', 'FedAvg'], size: 'standard' },
  { mark: 'GO', label: 'Blockchain systems', description: 'Traceable, permissioned workflows for complex real-world operations.', tools: ['Hyperledger Fabric', 'Go', 'CouchDB', 'IPFS'], size: 'standard' },
  { mark: 'OPS', label: 'Cloud delivery', description: 'Portable builds and dependable production deployment.', tools: ['Docker', 'AWS', 'Cloudflare', 'GitHub'], size: 'wide' },
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
        <div className="section-heading tech-stack-heading">
          <div><p className="eyebrow">Technology stack</p><h2 id="tech-stack-heading">Tools I trust.<br /><em>Systems that scale.</em></h2></div>
          <p>A cross-functional toolkit for taking ambitious products from first commit to production.</p>
        </div>
        <div className="stack-snapshot" aria-label="Technology overview">
          <p><strong>05</strong><span>engineering<br />disciplines</span></p>
          <p><strong>20+</strong><span>production-ready<br />technologies</span></p>
          <p><strong>01</strong><span>product-minded<br />workflow</span></p>
        </div>
        <div className="stack-bento">
          {stackCards.map((card, index) => (
            <article className={'stack-card stack-card-' + card.size} key={card.label}>
              <span className="stack-card-index">0{index + 1}</span>
              <b className="stack-card-mark" aria-hidden="true">{card.mark}</b>
              <div><p>{card.label}</p><h3>{card.description}</h3></div>
              <ul>{card.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
            </article>
          ))}
        </div>
        <div className="stack-footer"><p><span /> Selected for the problem, never for the trend</p><Link href="/about">Explore my technical background ↗</Link></div>
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
