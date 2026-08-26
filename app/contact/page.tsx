import SiteHeader from '@/components/SiteHeader';
import ContactForm from '@/components/ContactForm';

export default function ContactPage() {
  return (
    <main className="inner-page contact-page">
      <SiteHeader solid />
      <section className="contact-layout">
        <div><p className="eyebrow">Start a project</p><h1>Let&apos;s build<br /><span className="serif-line">something <em>useful.</em></span></h1><p>Share a little about your idea. I usually respond within two working days.</p>
          <div className="contact-links"><a href="mailto:amitkumarabhinav59@gmail.com">amitkumarabhinav59@gmail.com</a><a href="https://www.linkedin.com/in/amit864kumar/" target="_blank" rel="noreferrer">LinkedIn ↗</a></div>
        </div>
        <ContactForm />
      </section>
    </main>
  );
}
