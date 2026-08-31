'use client';

import { useEffect, useRef } from 'react';
import { Clock3, Mail, MessageSquare, Send, UsersRound } from 'lucide-react';

const EMAIL = 'amitkumarabhinav59@gmail.com';

export default function ContactHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const visual = visualRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!section || !visual || reduceMotion.matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const centerOffset = window.innerHeight * 0.5 - (rect.top + rect.height * 0.5);
      const progress = Math.max(-1, Math.min(1, centerOffset / window.innerHeight));
      visual.style.setProperty('--contact-scroll-y', `${progress * 22}px`);
      visual.style.setProperty('--contact-scroll-angle', `${progress * 86}deg`);
      visual.style.setProperty('--contact-scroll-reverse-angle', `${progress * -62}deg`);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={sectionRef} className="contact-reference-hero" aria-labelledby="contact-heading">
      <div className="contact-reference-backdrop" aria-hidden="true"><i /><i /><i /></div>

      <div className="contact-reference-copy">
        <p className="contact-reference-kicker">Let&apos;s connect <span /></p>
        <h1 id="contact-heading">Let&apos;s create <em>something meaningful.</em></h1>
        <p className="contact-reference-intro">
          Share your idea, challenge, or collaboration goal. I&apos;ll help shape a clear path from complexity to a dependable digital product.
        </p>
        <div className="contact-reference-actions">
          <a className="contact-reference-primary" href="#contact-intake">
            <MessageSquare aria-hidden="true" />
            Start a conversation
          </a>
          <a className="contact-reference-secondary" href={`mailto:${EMAIL}`}>
            <Mail aria-hidden="true" />
            Email me directly
          </a>
        </div>
      </div>

      <div ref={visualRef} className="contact-reference-visual">
        <div className="contact-reference-cards">
          <a className="contact-reference-card" href={`mailto:${EMAIL}`}>
            <span className="contact-reference-card-icon"><Mail aria-hidden="true" /></span>
            <span><small>Email</small><strong>{EMAIL}</strong></span>
          </a>
          <article className="contact-reference-card">
            <span className="contact-reference-card-icon"><Clock3 aria-hidden="true" /></span>
            <span><small>Response time</small><strong>Within 24 hours</strong></span>
          </article>
          <article className="contact-reference-card">
            <span className="contact-reference-card-icon"><UsersRound aria-hidden="true" /></span>
            <span><small>Collaboration</small><strong>Open to freelance &amp; collaboration</strong></span>
          </article>
        </div>

        <div className="contact-reference-orbit" aria-hidden="true">
          <i /><i /><i />
          <span className="contact-orbit-dot dot-one" />
          <span className="contact-orbit-dot dot-two" />
          <span className="contact-orbit-dot dot-three" />
          <b><Send /></b>
        </div>
      </div>
    </section>
  );
}
