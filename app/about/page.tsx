import Image from 'next/image';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const skills = ['React.js', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Hyperledger Fabric', 'Go', 'Docker', 'AWS', 'PyTorch'];
export default function AboutPage() {
  return (
    <main className="inner-page">
      <SiteHeader solid />
      <section className="about-hero">
        <div><p className="eyebrow">About Amit</p><h1>Research-minded.<br /><span className="serif-line">Product <em>focused.</em></span></h1></div>
        <div className="about-photo"><Image src="/amit-kumar.jpeg" alt="Amit Kumar" fill sizes="(max-width: 800px) 90vw, 38vw" priority /></div>
      </section>
      <section className="about-story">
        <p className="large-copy">I&apos;m a computer science undergraduate and full-stack developer with research experience at IIT Patna. I turn ambitious ideas into clear, scalable digital products.</p>
        <div>
          <p>My work sits at the intersection of software engineering, distributed systems, applied AI, and thoughtful interface design. I enjoy solving complex infrastructure problems without passing that complexity on to the user.</p>
          <p>From academic portals and event platforms to blockchain supply chains and federated learning, I care about systems that are useful, resilient, and built with intent.</p>
          <a className="button button-primary" href="/resume-amit-kumar.pdf" download>Download résumé ↓</a>
        </div>
      </section>
      <section className="skills-section"><p className="eyebrow">Capabilities</p><div>{skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>
      <section className="timeline">
        <p className="eyebrow">Experience</p>
        {[
          ['2026', 'Museiac', 'Full-Stack Developer'],
          ['2025', 'IIT Patna — Wireless Communication Research Lab', 'Web Developer'],
          ['2025', 'PhotoFinder', 'Lead Developer'],
          ['2024', 'IIT Patna — Mechanical Engineering', 'Web Development Intern'],
        ].map((item) => <div className="timeline-row" key={item[1]}><span>{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p></div>)}
      </section>
      <SiteFooter />
    </main>
  );
}
