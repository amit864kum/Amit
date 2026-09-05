'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, AtSign, BriefcaseBusiness, Check, CheckCircle2, ChevronDown, CircleDollarSign, FileText, MessageSquareText, RotateCcw, Sparkles, UserRound, type LucideIcon } from 'lucide-react';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: { sitekey: string; action: string; theme: 'auto' }) => string;
    };
  }
}

const steps = [
  { label: 'About you', description: 'How can Amit reach you?', eyebrow: 'Contact details', icon: UserRound },
  { label: 'The project', description: 'What kind of work is this?', eyebrow: 'Project direction', icon: BriefcaseBusiness },
  { label: 'The brief', description: 'What should success look like?', eyebrow: 'Project context', icon: FileText },
];

const serviceOptions = [
  'Full-stack development',
  'Blockchain product',
  'Portfolio or brand website',
  'Technical consulting',
  'Something else',
];

const budgetOptions = [
  { value: '', label: 'Prefer not to say' },
  { value: 'Under ₹50,000', label: 'Under ₹50,000' },
  { value: '₹50,000–₹1,50,000', label: '₹50,000–₹1,50,000' },
  { value: '₹1,50,000+', label: '₹1,50,000+' },
];

type StyledSelectProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  error?: string;
  icon?: LucideIcon;
  onChange: (value: string) => void;
};

function StyledSelect({ id, label, value, placeholder, options, required, error, icon: Icon, onChange }: StyledSelectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reduceMotion = useReducedMotion();
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedLabel = options.find((option) => option.value === value)?.label;

  function openAt(index: number) {
    setOpen(true);
    window.requestAnimationFrame(() => optionRefs.current[Math.max(0, index)]?.focus());
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openAt(event.key === 'ArrowUp' ? options.length - 1 : Math.max(0, selectedIndex));
    }
  }

  function handleOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      optionRefs.current[(index + direction + options.length) % options.length]?.focus();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  return <div className={`contact-select-field${open ? ' is-open' : ''}${error ? ' has-error' : ''}`} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  }}>
    <div className="contact-field-label"><span>{Icon ? <Icon aria-hidden="true" /> : null}{label}</span>{required ? <b>Required</b> : <small>Optional</small>}</div>
    <button
      ref={triggerRef}
      id={id}
      className="contact-select-trigger"
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={`${id}-options`}
      aria-describedby={error ? `${id}-error` : undefined}
      onClick={() => setOpen((current) => !current)}
      onKeyDown={handleTriggerKeyDown}
    >
      <span className={selectedLabel ? '' : 'is-placeholder'}>{selectedLabel || placeholder}</span>
      <span className="contact-select-icon" aria-hidden="true"><ChevronDown /></span>
    </button>
    <AnimatePresence>
      {open ? <motion.div
        id={`${id}-options`}
        className="contact-select-menu"
        role="listbox"
        aria-label={label}
        initial={reduceMotion ? false : { opacity: 0, y: -8, scale: .985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: -5, scale: .99 }}
        transition={{ duration: .2, ease: [0.22, 1, 0.36, 1] }}
      >
        {options.map((option, index) => <button
          ref={(element) => { optionRefs.current[index] = element; }}
          key={`${option.value}-${option.label}`}
          type="button"
          role="option"
          aria-selected={option.value === value}
          tabIndex={-1}
          onKeyDown={(event) => handleOptionKeyDown(event, index)}
          onClick={() => { onChange(option.value); setOpen(false); triggerRef.current?.focus(); }}
        >
          <span><small>{String(index + 1).padStart(2, '0')}</small>{option.label}</span>
          {option.value === value ? <Check aria-hidden="true" /> : <i aria-hidden="true" />}
        </button>)}
      </motion.div> : null}
    </AnimatePresence>
    {error ? <p className="contact-field-error" id={`${id}-error`} role="alert">{error}</p> : null}
  </div>;
}

export default function ContactForm() {
  const panelRef = useRef<HTMLFieldSetElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const startedAtInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useReducedMotion();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [step, setStep] = useState(0);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [serviceError, setServiceError] = useState('');
  const [draft, setDraft] = useState({ name: '', email: '', service: '', customService: '', budget: '', message: '' });
  const [draftReady, setDraftReady] = useState(false);
  const submittedService = draft.service === 'Something else' ? `Other: ${draft.customService.trim()}` : draft.service;
  const ActiveStepIcon = steps[step].icon;
  const completion = Math.round(((step + 1) / steps.length) * 100);

  useEffect(() => {
    if (state === 'idle' && startedAtInputRef.current) {
      startedAtInputRef.current.value = String(Date.now());
    }
  }, [state]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = sessionStorage.getItem('contact-enquiry-draft');
        if (saved) {
          const parsed = JSON.parse(saved) as { draft?: typeof draft; step?: number };
          if (parsed.draft) setDraft(parsed.draft);
          if (Number.isInteger(parsed.step)) setStep(Math.max(0, Math.min(parsed.step || 0, steps.length - 1)));
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
    sessionStorage.setItem('contact-enquiry-draft', JSON.stringify({ draft, step }));
  }, [draft, draftReady, state, step]);

  useEffect(() => {
    const hasDraft = Object.values(draft).some((value) => value.trim().length > 0);
    if (!hasDraft || state === 'sent') return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [draft, state]);

  useEffect(() => {
    if (state === 'error') errorRef.current?.focus();
  }, [state]);

  useEffect(() => {
    if (step !== 2 || !turnstileSiteKey) return;
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
  }, [step, turnstileSiteKey]);

  function nextStep() {
    if (step === 1 && !draft.service) {
      setServiceError('Choose the option that best matches your project.');
      document.getElementById('contact-service')?.focus();
      return;
    }
    if (step === 1 && draft.service === 'Something else' && draft.customService.trim().length < 10) {
      const customService = document.getElementById('contact-custom-service') as HTMLTextAreaElement | null;
      customService?.reportValidity();
      customService?.focus();
      return;
    }
    const controls = Array.from(panelRef.current?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea') || []);
    const invalid = controls.find((control) => !control.checkValidity());
    if (invalid) { invalid.reportValidity(); invalid.focus(); return; }
    setServiceError('');
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

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
      setError('The connection was interrupted. Try again in a moment.');
      setState('error');
    }
  }

  if (state === 'sent') return <div className="contact-wizard-success" role="status">
    <span><CheckCircle2 aria-hidden="true" /> Enquiry received</span>
    <h3>Thank you for<br /><em>starting the conversation.</em></h3>
    <p>Your brief has been received. A personal reply will be sent to your email, usually within two working days.</p>
    <button type="button" onClick={() => { sessionStorage.removeItem('contact-enquiry-draft'); setDraft({ name: '', email: '', service: '', customService: '', budget: '', message: '' }); setState('idle'); setStep(0); }}><RotateCcw aria-hidden="true" /> Send another enquiry</button>
  </div>;

  return <form className="contact-wizard contact-form-premium" action={submit}>
    <input type="hidden" name="name" value={draft.name} />
    <input type="hidden" name="email" value={draft.email} />
    <input type="hidden" name="service" value={submittedService} />
    <input type="hidden" name="budget" value={draft.budget} />
    <input type="hidden" name="message" value={draft.message} />
    <input ref={startedAtInputRef} type="hidden" name="startedAt" defaultValue="" />
    <label className="contact-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" /></label>
    <header className="contact-wizard-head">
      <div className="contact-wizard-brand"><span><Sparkles aria-hidden="true" /></span><div><b>Project enquiry</b><small>Amit Kumar / Independent practice</small></div></div>
      <div className="contact-wizard-meter"><span>Brief completion</span><strong>{completion}%</strong><i aria-hidden="true"><b style={{ width: `${completion}%` }} /></i></div>
    </header>

    <ol className="contact-wizard-progress" aria-label="Enquiry progress">
      {steps.map((item, index) => { const StepIcon = item.icon; return <li key={item.label} aria-label={`Step ${index + 1} of ${steps.length}: ${item.label}${index < step ? ', complete' : index === step ? ', current' : ''}`} aria-current={index === step ? 'step' : undefined} className={index === step ? 'active' : index < step ? 'complete' : ''}><span>{index < step ? <Check aria-hidden="true" /> : <StepIcon aria-hidden="true" />}</span><b><strong>{item.label}</strong><small>{item.description}</small></b><i /></li>; })}
    </ol>

    <div className="contact-wizard-stage">
      <div className="contact-stage-heading"><span><ActiveStepIcon aria-hidden="true" /></span><div><small>{steps[step].eyebrow}</small><h3>{steps[step].label}</h3></div><b>{String(step + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</b></div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.fieldset ref={panelRef} key={step} initial={reduceMotion ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? undefined : { opacity: 0, x: -18 }} transition={{ duration: .3, ease: [0.22, 1, 0.36, 1] }} onAnimationComplete={() => { if (step > 0) panelRef.current?.querySelector<HTMLElement>('input:not([type="hidden"]), textarea, button')?.focus(); }}>
          {step === 0 ? <>
            <legend>Let&apos;s begin with the essentials.</legend>
            <div className="contact-field-grid">
              <label className="contact-input-card" htmlFor="contact-name"><span><span><UserRound aria-hidden="true" />Your name</span><b>Required</b></span><input id="contact-name" required maxLength={80} autoComplete="name" placeholder="How should I address you?" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
              <label className="contact-input-card" htmlFor="contact-email"><span><span><AtSign aria-hidden="true" />Email address</span><b>Required</b></span><input id="contact-email" type="email" required maxLength={120} autoComplete="email" placeholder="you@company.com" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label>
            </div>
          </> : null}
          {step === 1 ? <>
            <legend>Define the shape of the work.</legend>
            <StyledSelect id="contact-service" icon={BriefcaseBusiness} label="What can I help with?" required value={draft.service} placeholder="Select a service" error={serviceError} options={serviceOptions.map((option) => ({ value: option, label: option }))} onChange={(service) => { setDraft({ ...draft, service }); setServiceError(''); }} />
            <AnimatePresence initial={false}>
              {draft.service === 'Something else' ? <motion.label
                className="contact-custom-service contact-input-card"
                htmlFor="contact-custom-service"
                initial={reduceMotion ? false : { opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: .22 }}
              >
                <span><span><MessageSquareText aria-hidden="true" />Tell me what you need</span><b>Required</b></span>
                <textarea id="contact-custom-service" required minLength={10} maxLength={500} rows={4} aria-describedby="contact-custom-service-help" placeholder="Describe the service, challenge, or specialist support you need." value={draft.customService} onChange={(event) => setDraft({ ...draft, customService: event.target.value })} />
                <small className="contact-field-meta" id="contact-custom-service-help"><span>Include the outcome you are aiming for.</span><b>{draft.customService.length} / 500</b></small>
              </motion.label> : null}
            </AnimatePresence>
            <StyledSelect id="contact-budget" icon={CircleDollarSign} label="Approximate budget" value={draft.budget} placeholder="Prefer not to say" options={budgetOptions} onChange={(budget) => setDraft({ ...draft, budget })} />
          </> : null}
          {step === 2 ? <>
            <legend>Share the challenge in your own words.</legend>
            <label className="contact-input-card contact-message-card" htmlFor="contact-message"><span><span><MessageSquareText aria-hidden="true" />Project context</span><b>Required</b></span><textarea id="contact-message" required minLength={20} maxLength={3000} rows={8} aria-describedby="contact-message-help" placeholder="What are you building, why does it matter, and what should a successful outcome look like?" value={draft.message} onChange={(event) => setDraft({ ...draft, message: event.target.value })} /><small className="contact-field-meta" id="contact-message-help"><span>Timelines, constraints, and links are welcome.</span><b>{draft.message.length} / 3000</b></small></label>
            {turnstileSiteKey ? <div className="contact-turnstile" ref={turnstileRef} aria-label="Bot verification" /> : null}
          </> : null}
        </motion.fieldset>
      </AnimatePresence>
    </div>

    <footer className="contact-wizard-actions">
      <div>
        {step > 0 ? <button className="contact-wizard-back" type="button" onClick={() => setStep((current) => current - 1)}><ArrowLeft aria-hidden="true" /> Back</button> : null}
        {step < steps.length - 1 ? <button key={`continue-${step}`} className="contact-wizard-next" type="button" onClick={nextStep}>Continue <ArrowRight aria-hidden="true" /></button> : <button key="submit-enquiry" className="contact-wizard-next" type="submit" disabled={state === 'sending'}>{state === 'sending' ? <><span className="contact-submit-spinner" aria-hidden="true" /> Sending</> : <>Send enquiry <ArrowUpRight aria-hidden="true" /></>}</button>}
      </div>
    </footer>
    {state === 'error' ? <p ref={errorRef} className="contact-wizard-error" role="alert" tabIndex={-1}>{error}</p> : null}
  </form>;
}
