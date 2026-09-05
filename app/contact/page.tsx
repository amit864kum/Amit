import type { Metadata } from 'next';
import { ArrowUpRight, Clock3, Mail } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import ContactForm from '@/components/ContactForm';
import ContactHero from '@/components/ContactHero';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Hire Amit Kumar — Freelance Web Developer in Patna',
  description: 'Contact Amit Kumar for freelance full-stack development, premium portfolio websites, blockchain products, and technical consulting in Patna or remotely.',
  alternates: { canonical: '/contact' },
  openGraph: { title: 'Hire Amit Kumar — Freelance Developer in Patna', description: 'Start a full-stack, blockchain, or premium web project with Amit Kumar.', url: '/contact', images: [{ url: '/og-social.jpg', width: 1200, height: 630, alt: 'Contact Amit Kumar for a freelance development project' }] },
  twitter: { card: 'summary_large_image', title: 'Hire Amit Kumar — Freelance Developer in Patna', description: 'Start a full-stack, blockchain, or premium web project with Amit Kumar.', images: ['/og-social.jpg'] },
};

export default function ContactPage() {
  return <main className="inner-page contact-reframe">
    <SiteHeader solid />

    <ContactHero />

    <section className="contact-intake" id="contact-intake" aria-labelledby="intake-title">
      <aside className="contact-intake-aside">
        <p className="contact-intake-kicker"><span />Start a conversation</p>
        <h2 id="intake-title">Let&apos;s shape<br /><em>something useful.</em></h2>
        <p className="contact-intake-copy">Share the idea, challenge, or outcome you have in mind. A clear starting point is enough—we can shape the details together.</p>
        <ul className="contact-intake-tags" aria-label="Areas of collaboration"><li>Full-stack</li><li>Product design</li><li>Blockchain</li><li>Research</li></ul>
        <dl>
          <div><dt><Clock3 aria-hidden="true" /> Response</dt><dd>Within two working days</dd></div>
          <div><dt><Mail aria-hidden="true" /> Prefer email?</dt><dd><a href="mailto:amitkumarabhinav59@gmail.com">Write directly <ArrowUpRight aria-hidden="true" /></a></dd></div>
        </dl>
      </aside>
      <ContactForm />
    </section>

    <section className="contact-reframe-close" aria-label="Alternative contact">
      <p>Not ready for a full brief?</p>
      <a href="https://www.linkedin.com/in/amit864kumar/" target="_blank" rel="noreferrer">Start a conversation on LinkedIn <ArrowUpRight aria-hidden="true" /></a>
    </section>
    <SiteFooter />
  </main>;
}
