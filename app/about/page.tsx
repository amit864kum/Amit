import Image from 'next/image';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const disciplines = [
  { number: '01', title: 'Build', statement: 'Product engineering from interface to database.', tools: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'] },
  { number: '02', title: 'Explore', statement: 'Research-led systems that test ambitious ideas.', tools: ['Python', 'PyTorch', 'Federated Learning', 'Computer Vision', 'P2P'] },
  { number: '03', title: 'Trust', statement: 'Traceable infrastructure for high-stakes workflows.', tools: ['Hyperledger Fabric', 'Go', 'CouchDB', 'IPFS', 'Smart Contracts'] },
  { number: '04', title: 'Ship', statement: 'Reliable delivery across modern cloud environments.', tools: ['Docker', 'AWS', 'Cloudflare', 'Git', 'GitHub'] },
];
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
      <section className="about-toolkit" aria-labelledby="about-toolkit-heading">
        <div className="about-toolkit-heading">
          <p className="eyebrow">Technical practice</p>
          <h2 id="about-toolkit-heading">A toolkit shaped by<br /><em>what the work demands.</em></h2>
          <p>I move comfortably between product engineering, applied research, distributed trust, and production delivery.</p>
        </div>
        <div className="discipline-grid">
          {disciplines.map((discipline) => (
            <article className="discipline-card" key={discipline.title}>
              <header><span>{discipline.number}</span><b>{discipline.title}</b></header>
              <p>{discipline.statement}</p>
              <ul>{discipline.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
            </article>
          ))}
        </div>
        <div className="toolkit-marquee" aria-label="Core technologies"><span>Next.js</span><i>◆</i><span>Hyperledger</span><i>◆</i><span>PyTorch</span><i>◆</i><span>Docker</span><i>◆</i><span>PostgreSQL</span></div>
      </section>
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
