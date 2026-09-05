'use client';

import { ArrowUpRight, AtSign, CheckCircle2, MessageSquareText, RotateCcw, Sparkles, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: { render: (element: HTMLElement, options: { sitekey: string; action: string; theme: 'auto' }) => string };
  }
}

type Draft = { name: string; email: string; contactDetails: string };
const emptyDraft: Draft = { name: '', email: '', contactDetails: '' };

export default function ContactForm() {
  const startedAtInputRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [draftReady, setDraftReady] = useState(false);

  useEffect(() => {
    if (startedAtInputRef.current) startedAtInputRef.current.value = String(Date.now());
  }, [state]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = sessionStorage.getItem('contact-enquiry-draft');
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<Draft>;
          setDraft({
            name: typeof parsed.name === 'string' ? parsed.name : '',
            email: typeof parsed.email === 'string' ? parsed.email : '',
            contactDetails: typeof parsed.contactDetails === 'string' ? parsed.contactDetails : '',
          });
        }
      } catch {
        sessionStorage.removeItem('contact-enquiry-draft');
      } finally {
        setDraftReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!draftReady || state === 'sent') return;
    sessionStorage.setItem('contact-enquiry-draft', JSON.stringify(draft));
  }, [draft, draftReady, state]);

  useEffect(() => {
    if (state === 'error') errorRef.current?.focus();
  }, [state]);

  useEffect(() => {
    if (!turnstileSiteKey) return;
    let timer = 0;
    const render = () => {
      const element = turnstileRef.current;
      if (!element || !window.turnstile) return;
      if (element.dataset.rendered) {
        if (timer) window.clearInterval(timer);
        return;
      }
      window.turnstile.render(element, { sitekey: turnstileSiteKey, action: 'contact', theme: 'auto' });
      element.dataset.rendered = 'true';
      if (timer) window.clearInterval(timer);
    };
    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.turnstile = 'true';
      script.addEventListener('load', render, { once: true });
      document.head.appendChild(script);
    } else if (window.turnstile) render();
    else timer = window.setInterval(render, 150);
    return () => { if (timer) window.clearInterval(timer); };
  }, [turnstileSiteKey]);

  async function submit(formData: FormData) {
    setState('sending');
    setError('');
    try {
      const response = await fetch('/api/contact', { method: 'POST', body: formData });
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error || 'The enquiry could not be sent. Check your details and try again.');
        setState('error');
        return;
      }
      sessionStorage.removeItem('contact-enquiry-draft');
      setState('sent');
    } catch {
      setError('The connection was interrupted. Please try again in a moment.');
      setState('error');
    }
  }

  if (state === 'sent') return <div className="contact-wizard-success contact-simple-success" role="status">
    <span><CheckCircle2 aria-hidden="true" /> Enquiry received</span>
    <h3>Thank you for<br /><em>getting in touch.</em></h3>
    <p>Your contact details have been received. A personal reply will be sent to your email, usually within two working days.</p>
    <button type="button" onClick={() => { sessionStorage.removeItem('contact-enquiry-draft'); setDraft(emptyDraft); setState('idle'); }}><RotateCcw aria-hidden="true" /> Send another enquiry</button>
  </div>;

  return <form className="contact-wizard contact-form-premium contact-simple-form" action={submit}>
    <input ref={startedAtInputRef} type="hidden" name="startedAt" defaultValue="" />
    <label className="contact-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" /></label>
    <header className="contact-wizard-head contact-simple-head">
      <div className="contact-wizard-brand"><span><Sparkles aria-hidden="true" /></span><div><b>Contact</b><small>Amit Kumar / Independent practice</small></div></div>
    </header>

    <fieldset className="contact-simple-fields">
      <legend>Send an enquiry.</legend>
      <p>Share your name, email, and the best way to contact you.</p>
      <div className="contact-field-grid">
        <label className="contact-input-card" htmlFor="contact-name">
          <span><UserRound aria-hidden="true" />Name</span>
          <input id="contact-name" name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder="Your full name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
        </label>
        <label className="contact-input-card" htmlFor="contact-email">
          <span><AtSign aria-hidden="true" />Email ID</span>
          <input id="contact-email" name="email" type="email" required maxLength={120} autoComplete="email" inputMode="email" placeholder="you@example.com" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
        </label>
      </div>
      <label className="contact-input-card contact-details-card" htmlFor="contact-details">
        <span><MessageSquareText aria-hidden="true" />Contact details</span>
        <textarea id="contact-details" name="contactDetails" required minLength={5} maxLength={1000} rows={5} aria-describedby="contact-details-help" value={draft.contactDetails} onChange={(event) => setDraft({ ...draft, contactDetails: event.target.value })} />
        <small className="contact-field-meta" id="contact-details-help"><span>Include at least one reliable way to reach you.</span><b>{draft.contactDetails.length} / 1000</b></small>
      </label>
      {turnstileSiteKey ? <div className="contact-turnstile" ref={turnstileRef} aria-label="Bot verification" /> : null}
    </fieldset>

    <footer className="contact-wizard-actions contact-simple-actions">
      <p>Your details are used only to reply to this enquiry.</p>
      <button className="contact-wizard-next" type="submit" disabled={state === 'sending'}>{state === 'sending' ? <><span className="contact-submit-spinner" aria-hidden="true" /> Sending</> : <>Send enquiry <ArrowUpRight aria-hidden="true" /></>}</button>
    </footer>
    {state === 'error' ? <p ref={errorRef} className="contact-wizard-error" role="alert" tabIndex={-1}>{error}</p> : null}
  </form>;
}
