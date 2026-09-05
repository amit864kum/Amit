import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Box, BrainCircuit, Cloud, Code2, Landmark, Network, Target, type LucideIcon } from 'lucide-react';
import { brandIcons, hyperledgerFabricLogo, type BrandMark } from '@/lib/brand-icons';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ScrollScene from '@/components/ScrollScene';
import MagneticLink from '@/components/MagneticLink';
import ScrollTicker from '@/components/ScrollTicker';
import HomeSelectedWork from '@/components/HomeSelectedWork';
import { getProjectCount, getProjects } from '@/lib/content';
import StructuredData from '@/components/StructuredData';
import { absoluteUrl, siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Amit Kumar — Full-Stack & Blockchain Developer in Patna',
  description: 'Explore Amit Kumar’s portfolio of full-stack web applications, blockchain platforms, applied AI systems, and research-led digital products built in Patna.',
  alternates: { canonical: '/' },
  openGraph: { title: siteConfig.title, description: siteConfig.description, url: '/', images: [{ url: '/og-social.jpg', width: 1200, height: 630, alt: 'Amit Kumar developer portfolio' }] },
  twitter: { card: 'summary_large_image', title: siteConfig.title, description: siteConfig.description, images: ['/og-social.jpg'] },
};

export const dynamic = 'force-dynamic';
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
      data-brand={tool.name}
      style={{ color: `#${tool.icon.hex}` }}
    >
      <path d={tool.icon.path} />
    </svg>
  );
}

export default async function Home() {
  const [projectCount, featuredProjects] = await Promise.all([getProjectCount(), getProjects(true)]);
  const projectCountLabel = String(projectCount).padStart(2, '0');
  return (
    <main>
      <StructuredData data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Person', '@id': absoluteUrl('/#person'), name: siteConfig.name,
            url: absoluteUrl('/'), image: absoluteUrl('/amit-kumar.jpeg'),
            jobTitle: 'Full-Stack Developer and Blockchain Engineer',
            description: siteConfig.description,
            address: { '@type': 'PostalAddress', addressLocality: 'Patna', addressRegion: 'Bihar', addressCountry: 'IN' },
            email: `mailto:${siteConfig.email}`,
            sameAs: [siteConfig.linkedIn, siteConfig.github, siteConfig.instagram],
            knowsAbout: ['Full-stack development', 'Web development', 'Blockchain engineering', 'Applied AI', 'Distributed systems', 'Product design'],
          },
          {
            '@type': 'WebSite', '@id': absoluteUrl('/#website'), url: absoluteUrl('/'),
            name: 'Amit Kumar Portfolio', description: siteConfig.description,
            inLanguage: 'en-IN', publisher: { '@id': absoluteUrl('/#person') },
          },
          {
            '@type': 'ProfilePage', '@id': absoluteUrl('/#profile'), url: absoluteUrl('/'),
            name: 'Amit Kumar Portfolio', mainEntity: { '@id': absoluteUrl('/#person') },
            isPartOf: { '@id': absoluteUrl('/#website') },
          },
        ],
      }} />
      <SiteHeader />

      <ScrollScene className="hero home-hero-scene">
        <div className="hero-atmosphere" aria-hidden="true"><i /><i /><i /></div>
        <div className="hero-copy">
          <h1>I build digital<span className="serif-line">products with <em>purpose.</em></span></h1>
          <p className="intro">
            Based in Patna and working with clients remotely, I craft scalable full-stack
            and blockchain products where thoughtful design meets dependable code.
          </p>
          <div className="hero-actions">
            <MagneticLink href="/projects" className="button button-primary">Explore my work <span>↗</span></MagneticLink>
            <a href="mailto:amitkumarabhinav59@gmail.com" className="text-link">amitkumarabhinav59@gmail.com</a>
          </div>
          <div className="hero-proof" aria-label="Professional highlights">
            <p><i aria-hidden="true"><Box /></i><span><strong>{projectCountLabel}</strong><small>Projects &amp; research<br />platforms published</small></span></p>
            <p><i aria-hidden="true"><Code2 /></i><span><strong>04</strong><small>Engineering<br />disciplines</small></span></p>
            <p><i aria-hidden="true"><Landmark /></i><span><strong>IIT</strong><small>Patna research<br />experience</small></span></p>
          </div>
        </div>

        <figure className="portrait-wrap">
          <div className="portrait-visual">
            <div className="portrait-orbit orbit-one" aria-hidden="true" />
            <div className="portrait-orbit orbit-two" aria-hidden="true" />
            <div className="portrait-card">
              <Image src="/amit-kumar.jpeg" alt="Amit Kumar in a black suit" fill sizes="(max-width: 800px) 86vw, 36vw" priority />
            </div>
          </div>
          <figcaption className="portrait-profile">
            <div className="portrait-profile-focus"><span>Current focus <Target aria-hidden="true" /></span><strong>Building products<br />that earn trust.</strong><i aria-hidden="true" /></div>
            <div className="portrait-build-card"><Box aria-hidden="true" /><span><strong>{projectCountLabel}</strong><small>Projects published</small></span><i aria-hidden="true" /></div>
            <div className="portrait-role" aria-label="Core disciplines"><span>Full-stack</span><span>Blockchain</span><span>Applied AI</span></div>
          </figcaption>
        </figure>
      </ScrollScene>

      <ScrollTicker items={['Full-stack systems', 'Blockchain products', 'Applied AI', 'Product experience', 'Cloud delivery']} />

      <HomeSelectedWork projects={featuredProjects.slice(0, 3)} />

      <section className="what-i-do" aria-labelledby="what-i-do-heading">
        <div className="what-i-do-atmosphere" aria-hidden="true"><i /><i /><i /></div>
        <div className="what-i-do-intro">
          <p className="eyebrow"><span aria-hidden="true" />What I do</p>
          <h2 id="what-i-do-heading">Ideas in.<br /><em>Impact out.</em></h2>
          <p>I work at the intersection of product thinking, emerging technology, and reliable engineering.</p>
          <Link href="/projects" prefetch={false} className="read-link what-i-do-link"><span>See the work behind it</span><i aria-hidden="true"><ArrowUpRight /></i></Link>
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
              <Image
                src="/tech-stack-architecture.webp"
                alt=""
                width={1152}
                height={1536}
                sizes="(max-width: 820px) 90vw, (max-width: 1080px) 46vw, 34vw"
              />
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

      <SiteFooter />
    </main>
  );
}
