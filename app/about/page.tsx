import type { Metadata } from 'next';
import Image from 'next/image';
import { Bookmark, Boxes, BookOpen, Code2, Download, DraftingCompass, Landmark, Link2, Rocket, Sparkles, UserRound } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ScrollScene from '@/components/ScrollScene';
import ScrollDepthCards from '@/components/ScrollDepthCards';
import TechnicalPractice from '@/components/TechnicalPractice';
import { getProjectCount, getResumeSettings } from '@/lib/content';
import StructuredData from '@/components/StructuredData';
import { absoluteUrl, siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'About Amit Kumar — Full-Stack Developer in Patna',
  description: 'Meet Amit Kumar, a full-stack and blockchain developer in Patna with IIT Patna research experience across web engineering, distributed systems, and applied AI.',
  alternates: { canonical: '/about' },
  openGraph: { title: 'About Amit Kumar — Developer & Researcher', description: 'Full-stack engineering, blockchain, applied AI, and research experience in Patna.', url: '/about', images: [{ url: '/og-social.jpg', width: 1200, height: 630, alt: 'About Amit Kumar' }] },
  twitter: { card: 'summary_large_image', title: 'About Amit Kumar — Developer & Researcher', description: 'Full-stack engineering, blockchain, applied AI, and research experience in Patna.', images: ['/og-social.jpg'] },
};
const experience = [
  { year: '2026', company: 'Museiac', role: 'Full-Stack Developer', summary: 'Building a scalable music platform through typed product interfaces, optimized APIs, and dependable data systems.', focus: ['Next.js', 'Node.js', 'PostgreSQL'] },
  { year: '2025', company: 'IIT Patna — Wireless Communication Research Lab', role: 'Web Developer', summary: 'Designed and deployed an academic platform that makes 5G/6G research, publications, people, and laboratory infrastructure easier to navigate.', focus: ['Research UX', 'Next.js', 'Deployment'] },
  { year: '2025', company: 'PhotoFinder', role: 'Lead Developer', summary: 'Led an AI-powered event photo discovery product from mobile-first experience design through high-volume image workflows.', focus: ['AI Vision', 'Full-stack', 'Product'] },
  { year: '2024', company: 'IIT Patna — Mechanical Engineering', role: 'Web Development Intern', summary: 'Translated institutional requirements into a clear, responsive digital experience for an academic department.', focus: ['Frontend', 'Information Design', 'Accessibility'] },
];

export const revalidate = 300;

export default async function AboutPage() {
  const [projectCount, resume] = await Promise.all([getProjectCount(), getResumeSettings()]);
  const projectCountLabel = String(projectCount).padStart(2, '0');
  return (
    <main className="inner-page">
      <StructuredData data={{ '@context': 'https://schema.org', '@type': 'ProfilePage', '@id': absoluteUrl('/about#profile'), url: absoluteUrl('/about'), name: 'About Amit Kumar', mainEntity: { '@type': 'Person', '@id': absoluteUrl('/#person'), name: siteConfig.name, jobTitle: 'Full-Stack Developer and Blockchain Engineer', homeLocation: { '@type': 'Place', name: siteConfig.location }, sameAs: [siteConfig.linkedIn, siteConfig.github, siteConfig.instagram] } }} />
      <SiteHeader solid />
      <ScrollScene className="about-hero-scene">
        <div className="about-atmosphere" aria-hidden="true"><i /><i /></div>
        <div className="about-hero-stage">
          <div className="about-portrait-scene">
            <div className="portrait-plane portrait-plane-back" /><div className="portrait-plane portrait-plane-mid" />
            <figure><Image src="/amit-kumar.jpeg" alt="Portrait of Amit Kumar, full-stack developer in Patna" fill sizes="(max-width: 800px) 92vw, 44vw" priority /></figure>
            <div className="about-portrait-dots" aria-hidden="true" />
          </div>
          <div className="about-landing-copy">
            <div className="about-hero-message">
              <h1><span>Developer</span><span>by <em>craft.</em></span><small>Researcher by instinct.</small></h1>
              <i className="about-hero-rule" aria-hidden="true" />
              <p>I build useful digital products at the intersection of full-stack engineering, distributed systems, and applied intelligence.</p>
            </div>
            <div className="about-signals" aria-label="Professional highlights">
              <p><i><DraftingCompass aria-hidden="true" /></i><span><strong>04</strong><small>Engineering<br />disciplines</small></span></p>
              <p><i><Landmark aria-hidden="true" /></i><span><strong>IIT</strong><small>Research<br />experience</small></span></p>
              <p><i><Rocket aria-hidden="true" /></i><span><strong>{projectCountLabel}</strong><small>Projects<br />published</small></span></p>
            </div>
          </div>
        </div>
      </ScrollScene>

      <section className="about-profile" aria-labelledby="about-profile-heading">
        <div className="about-profile-grid" aria-hidden="true" />
        <div className="about-profile-orbits" aria-hidden="true"><i /><i /><i /></div>
        <div className="about-profile-intro">
          <p className="about-profile-kicker"><span>About me</span><i /></p>
          <h2 id="about-profile-heading">I&apos;m a computer science<br />undergraduate and<br />full-stack developer with<br />research experience at<br />IIT Patna.</h2>
          <div className="about-profile-promise"><Sparkles aria-hidden="true" /><i /><p>I turn ambitious ideas into<br />clear, scalable digital products.</p></div>
        </div>

        <article className="about-profile-card">
          <div className="about-profile-card-body">
            <header><span><UserRound aria-hidden="true" /></span><h3>Who I am</h3></header>
            <div className="about-profile-copy"><p>My work sits at the intersection of software engineering, distributed systems, applied AI, and thoughtful interface design. I enjoy solving complex infrastructure problems without passing that complexity on to the user.</p><p>From academic portals and event platforms to blockchain supply chains and federated learning, I care about systems that are useful, resilient, and built with intent.</p></div>
            <ul className="about-profile-skills" aria-label="Core areas of expertise">
              <li><Code2 aria-hidden="true" />Full-stack</li>
              <li><Boxes aria-hidden="true" />Distributed Systems</li>
              <li><Sparkles aria-hidden="true" />Applied AI</li>
              <li><Link2 aria-hidden="true" />Blockchain</li>
              <li><BookOpen aria-hidden="true" />Research-driven</li>
            </ul>
            <div className="about-profile-actions"><a href={resume.resumeUrl} download><Download aria-hidden="true" />{resume.buttonLabel}</a><span><i />Available for collaborations</span></div>
          </div>
          <footer><Bookmark aria-hidden="true" /><p>Research <i /> Product Engineering <i /> Impact</p></footer>
        </article>
      </section>

      <TechnicalPractice />

      <section className="experience-section" aria-labelledby="experience-heading">
        <div className="experience-intro"><p className="eyebrow">Experience</p><h2 id="experience-heading">Learning by<br /><em>building forward.</em></h2><p>A career shaped by product ownership, academic research, and systems that solve tangible problems.</p><span>2024 — Present</span></div>
        <ScrollDepthCards>{experience.map((item, index) => <article className="experience-card" data-scroll-card key={item.company}><header><span>0{index + 1}</span><time>{item.year}</time></header><div><p>{item.role}</p><h3>{item.company}</h3><p>{item.summary}</p></div><footer>{item.focus.map((focus) => <span key={focus}>{focus}</span>)}</footer></article>)}</ScrollDepthCards>
      </section>
      <SiteFooter />
    </main>
  );
}
