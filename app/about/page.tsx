import Image from 'next/image';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const domains = [
  { number: '01', title: 'Product', statement: 'Useful experiences built around clear journeys and thoughtful interaction.', proof: 'React · Next.js · TypeScript' },
  { number: '02', title: 'Research', statement: 'Experimental ideas translated into systems people can actually use.', proof: 'PyTorch · Federated Learning' },
  { number: '03', title: 'Trust', statement: 'Verifiable infrastructure for workflows where accountability matters.', proof: 'Hyperledger · Go · IPFS' },
  { number: '04', title: 'Delivery', statement: 'Production-minded engineering from API design to cloud deployment.', proof: 'Node.js · Docker · AWS' },
];
export default function AboutPage() {
  return (
    <main className="inner-page">
      <SiteHeader solid />
      <section className="about-hero">
        <div><p className="eyebrow">About Amit</p><h1>Research-minded.<br /><span className="serif-line">Product <em>focused.</em></span></h1></div>
        <div className="about-photo"><Image src="/amit-kumar.jpeg" alt="Amit Kumar" fill sizes="(max-width: 800px) 90vw, 38vw" priority /></div>
      </section>
      <section className="about-editorial" aria-labelledby="about-story-heading">
        <div className="about-editorial-index"><span>01</span><p>Perspective</p></div>
        <div className="about-manifesto">
          <h2 id="about-story-heading">I make difficult technology feel <em>understandable.</em></h2>
          <div><p>I&apos;m a computer science undergraduate and full-stack developer with research experience at IIT Patna. My work connects software engineering, distributed systems, applied AI, and thoughtful interface design.</p><p>From academic portals and event platforms to blockchain supply chains and federated learning, I care about systems that are useful, resilient, and built with intent.</p></div>
          <a className="button button-primary" href="/resume-amit-kumar.pdf" download>Download résumé ↓</a>
        </div>
        <aside className="about-proof" aria-label="Career highlights">
          <p><strong>6+</strong><span>Professional builds</span></p>
          <p><strong>04</strong><span>Engineering domains</span></p>
          <p><strong>IIT</strong><span>Patna research experience</span></p>
        </aside>
      </section>
      <section className="about-domains" aria-labelledby="about-domains-heading">
        <header><p className="eyebrow">Working range</p><h2 id="about-domains-heading">One engineer.<br /><em>Four perspectives.</em></h2></header>
        <div>
          {domains.map((domain) => (
            <article className="domain-column" key={domain.title}>
              <span>{domain.number}</span><h3>{domain.title}</h3><p>{domain.statement}</p><small>{domain.proof}</small>
            </article>
          ))}
        </div>
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
