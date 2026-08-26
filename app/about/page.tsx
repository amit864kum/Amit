import Image from 'next/image';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ScrollScene from '@/components/ScrollScene';
import ScrollDepthCards from '@/components/ScrollDepthCards';

const disciplines = [
  { number: '01', title: 'Build', statement: 'Product engineering from interface to database.', tools: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'] },
  { number: '02', title: 'Explore', statement: 'Research-led systems that test ambitious ideas.', tools: ['Python', 'PyTorch', 'Federated Learning', 'Computer Vision', 'P2P'] },
  { number: '03', title: 'Trust', statement: 'Traceable infrastructure for high-stakes workflows.', tools: ['Hyperledger Fabric', 'Go', 'CouchDB', 'IPFS', 'Smart Contracts'] },
  { number: '04', title: 'Ship', statement: 'Reliable delivery across modern cloud environments.', tools: ['Docker', 'AWS', 'Cloudflare', 'Git', 'GitHub'] },
];
const experience = [
  { year: '2026', company: 'Museiac', role: 'Full-Stack Developer', summary: 'Building a scalable music platform through typed product interfaces, optimized APIs, and dependable data systems.', focus: ['Next.js', 'Node.js', 'PostgreSQL'] },
  { year: '2025', company: 'IIT Patna — Wireless Communication Research Lab', role: 'Web Developer', summary: 'Designed and deployed an academic platform that makes 5G/6G research, publications, people, and laboratory infrastructure easier to navigate.', focus: ['Research UX', 'Next.js', 'Deployment'] },
  { year: '2025', company: 'PhotoFinder', role: 'Lead Developer', summary: 'Led an AI-powered event photo discovery product from mobile-first experience design through high-volume image workflows.', focus: ['AI Vision', 'Full-stack', 'Product'] },
  { year: '2024', company: 'IIT Patna — Mechanical Engineering', role: 'Web Development Intern', summary: 'Translated institutional requirements into a clear, responsive digital experience for an academic department.', focus: ['Frontend', 'Information Design', 'Accessibility'] },
];

export default function AboutPage() {
  return (
    <main className="inner-page">
      <SiteHeader solid />
      <ScrollScene className="about-hero-scene">
        <div className="about-hero-stage">
          <div className="about-portrait-scene">
            <div className="portrait-plane portrait-plane-back" /><div className="portrait-plane portrait-plane-mid" />
            <figure><Image src="/amit-kumar.jpeg" alt="Amit Kumar" fill sizes="(max-width: 800px) 92vw, 44vw" priority /></figure>
            <span className="portrait-coordinate">25.5941° N / 85.1376° E</span>
          </div>
          <div className="about-landing-copy">
            <div className="about-landing-top"><p>About / 001</p><span>Engineer · Researcher · Builder</span></div>
            <h1>Developer<br />by <em>craft.</em><span>Researcher by instinct.</span></h1>
            <div className="about-landing-bottom"><p>I build useful digital products at the intersection of full-stack engineering, distributed systems, and applied intelligence.</p><span>Scroll to explore ↓</span></div>
          </div>
        </div>
      </ScrollScene>

      <section className="about-story">
        <p className="large-copy">I&apos;m a computer science undergraduate and full-stack developer with research experience at IIT Patna. I turn ambitious ideas into clear, scalable digital products.</p>
        <div><p>My work sits at the intersection of software engineering, distributed systems, applied AI, and thoughtful interface design. I enjoy solving complex infrastructure problems without passing that complexity on to the user.</p><p>From academic portals and event platforms to blockchain supply chains and federated learning, I care about systems that are useful, resilient, and built with intent.</p><a className="button button-primary" href="/resume-amit-kumar.pdf" download>Download résumé ↓</a></div>
      </section>

      <section className="about-toolkit" aria-labelledby="about-toolkit-heading">
        <div className="about-toolkit-heading"><p className="eyebrow">Technical practice</p><h2 id="about-toolkit-heading">A toolkit shaped by<br /><em>what the work demands.</em></h2><p>I move comfortably between product engineering, applied research, distributed trust, and production delivery.</p></div>
        <div className="discipline-grid">{disciplines.map((discipline) => <article className="discipline-card" key={discipline.title}><header><span>{discipline.number}</span><b>{discipline.title}</b></header><p>{discipline.statement}</p><ul>{discipline.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul></article>)}</div>
        <div className="toolkit-marquee" aria-label="Core technologies"><span>Next.js</span><i>◆</i><span>Hyperledger</span><i>◆</i><span>PyTorch</span><i>◆</i><span>Docker</span><i>◆</i><span>PostgreSQL</span></div>
      </section>

      <section className="experience-section" aria-labelledby="experience-heading">
        <div className="experience-intro"><p className="eyebrow">Experience</p><h2 id="experience-heading">Learning by<br /><em>building forward.</em></h2><p>A career shaped by product ownership, academic research, and systems that solve tangible problems.</p><span>2024 — Present</span></div>
        <ScrollDepthCards>{experience.map((item, index) => <article className="experience-card" data-scroll-card key={item.company}><header><span>0{index + 1}</span><time>{item.year}</time></header><div><p>{item.role}</p><h3>{item.company}</h3><p>{item.summary}</p></div><footer>{item.focus.map((focus) => <span key={focus}>{focus}</span>)}</footer></article>)}</ScrollDepthCards>
      </section>
      <SiteFooter />
    </main>
  );
}
