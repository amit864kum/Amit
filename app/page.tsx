import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Box, BrainCircuit, Cloud, Network, type LucideIcon } from 'lucide-react';
import { brandIcons, hyperledgerFabricLogo, type BrandMark } from '@/lib/brand-icons';
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
  { title: 'Full-Stack Product Development', description: 'I turn product ideas into scalable web applications—from interface architecture to production-ready APIs.', skills: ['Product UI', 'Backend APIs', 'Databases'], icon: Box },
  { title: 'Blockchain Systems', description: 'I build permissioned networks, smart-contract workflows, and traceable platforms for real operational challenges.', skills: ['Hyperledger Fabric', 'Go chaincode', 'IPFS'], icon: Network },
  { title: 'AI & Distributed Intelligence', description: 'I develop privacy-aware intelligent systems using computer vision, federated learning, and peer-to-peer coordination.', skills: ['AI vision', 'FedAvg', 'P2P systems'], icon: BrainCircuit },
  { title: 'Research Platforms', description: 'I translate academic work into usable platforms, demos, and research-oriented products.', skills: ['Research portals', 'Prototypes', 'Academic tools'], icon: BookOpen },
  { title: 'Cloud & Production Engineering', description: 'I deploy reliable systems with Docker, AWS, Cloudflare, CI/CD, and observability in mind.', skills: ['Docker', 'AWS', 'Cloudflare', 'CI/CD'], icon: Cloud },
] satisfies Array<{ title: string; description: string; skills: string[]; icon: LucideIcon }>;
type StackTool =
  | { name: string; icon: BrandMark; symbol?: never; imageSrc?: never }
  | { name: string; symbol: string; icon?: never; imageSrc?: never }
  | { name: string; imageSrc: string; icon?: never; symbol?: never };
type StackLayer = { label: string; number: string; description: string; tools: StackTool[] };

const stackLayers: StackLayer[] = [
  {
    label: 'Experience Layer',
    number: '01',
    description: 'Fast, accessible interfaces shaped around real user journeys.',
    tools: [
      { name: 'React', icon: brandIcons.react },
      { name: 'Next.js', icon: brandIcons.nextdotjs },
      { name: 'TypeScript', icon: brandIcons.typescript },
      { name: 'Tailwind CSS', icon: brandIcons.tailwindcss },
    ],
  },
  {
    label: 'Application Layer',
    number: '02',
    description: 'Typed services, real-time flows, and dependable data foundations.',
    tools: [
      { name: 'Node.js', icon: brandIcons.nodedotjs },
      { name: 'Express.js', icon: brandIcons.express },
      { name: 'REST APIs', symbol: '{ }' },
      { name: 'WebSockets', symbol: 'WS' },
      { name: 'PostgreSQL', icon: brandIcons.postgresql },
    ],
  },
  {
    label: 'Intelligence & Trust',
    number: '03',
    description: 'Applied AI and verifiable systems for complex product challenges.',
    tools: [
      { name: 'Python', icon: brandIcons.python },
      { name: 'PyTorch', icon: brandIcons.pytorch },
      { name: 'Hyperledger Fabric', imageSrc: hyperledgerFabricLogo },
      { name: 'Go', icon: brandIcons.go },
      { name: 'IPFS', icon: brandIcons.ipfs },
    ],
  },
  {
    label: 'Delivery Layer',
    number: '04',
    description: 'Portable, observable software ready for production environments.',
    tools: [
      { name: 'Docker', icon: brandIcons.docker },
      { name: 'AWS', icon: brandIcons.amazonaws },
      { name: 'Cloudflare', icon: brandIcons.cloudflare },
      { name: 'GitHub', icon: brandIcons.github },
    ],
  },
];

function StackToolIcon({ tool }: { tool: StackTool }) {
  if ('imageSrc' in tool) {
    return <Image className="stack-brand-wordmark" src={tool.imageSrc} alt={tool.name} width={118} height={30} unoptimized />;
  }
  if ('symbol' in tool) return <span className="stack-protocol-icon" aria-hidden="true">{tool.symbol}</span>;

  return (
    <svg
      className="stack-brand-icon"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ color: `#${tool.icon.hex}` }}
    >
      <path d={tool.icon.path} />
    </svg>
  );
}

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
            <MagneticLink href="/projects" className="button button-primary">Explore my work <span>↗</span></MagneticLink>
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
        <div className="what-i-do-atmosphere" aria-hidden="true"><i /><i /><i /></div>
        <div className="what-i-do-intro">
          <p className="eyebrow"><span aria-hidden="true" />What I do</p>
          <h2 id="what-i-do-heading">Ideas in.<br /><em>Impact out.</em></h2>
          <p>I work at the intersection of product thinking, emerging technology, and reliable engineering.</p>
          <Link href="/projects" className="read-link what-i-do-link"><span>See the work behind it</span><i aria-hidden="true"><ArrowUpRight /></i></Link>
        </div>
        <div className="service-grid">
          {services.map((service, index) => {
            const ServiceIcon = service.icon;
            return (
              <article className={`service-card service-card-${index + 1} ${index === 0 ? 'service-card-featured' : ''}`} key={service.title}>
                <header><span className="service-icon"><ServiceIcon aria-hidden="true" /></span></header>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div>{service.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="tech-stack" aria-labelledby="tech-stack-heading">
        <div className="stack-architecture">
          <div className="stack-blueprint">
            <div className="stack-blueprint-copy">
              <p className="eyebrow">Product architecture<span aria-hidden="true">—</span></p>
              <h2 id="tech-stack-heading">Tech Stack</h2>
              <p>Modern technologies I use to build scalable, reliable, and intelligent digital products.</p>
            </div>
            <div className="stack-blueprint-art" aria-hidden="true">
              <div className="stack-art-orbit" />
              <div className="stack-art-columns"><i /><i /><i /><i /><i /></div>
              <div className="stack-art-path"><i /><i /><i /></div>
            </div>
            <blockquote><span aria-hidden="true">“</span>Ideas become<br /><em>working systems.</em></blockquote>
            <small>Interface → Infrastructure</small>
          </div>
          <div className="stack-layers">
            {stackLayers.map((layer) => (
              <article className="stack-layer" key={layer.label}>
                <span>{layer.number}</span>
                <div><h3>{layer.label}</h3><p>{layer.description}</p></div>
                <ul>
                  {layer.tools.map((tool) => <li className="stack-tool" key={tool.name}><StackToolIcon tool={tool} />{'imageSrc' in tool ? null : <span>{tool.name}</span>}</li>)}
                </ul>
              </article>
            ))}
          </div>
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
            <Link href={`/projects/${project.slug}`} className="project-card" key={project.number}>
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
