import type { Metadata } from 'next';
import { ArrowUpRight, Clock3, Mail } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import ContactForm from '@/components/ContactForm';
import ContactHero from '@/components/ContactHero';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Contact — Amit Kumar',
  description: 'Start a project with Amit Kumar across product design, full-stack engineering, blockchain, and research-led digital systems.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return <main className="inner-page contact-reframe">
    <SiteHeader solid />

    <ContactHero />

    <section className="contact-intake" id="contact-intake" aria-labelledby="intake-title">
      <aside className="contact-intake-aside">
        <h2 id="intake-title">A focused<br /><em>first step.</em></h2>
        <p className="contact-intake-copy">Tell me what you&apos;re building, where you need support, and what a successful outcome looks like.</p>
        <dl>
          <div><dt><Clock3 aria-hidden="true" /> Response</dt><dd>Within 24 hours</dd></div>
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
