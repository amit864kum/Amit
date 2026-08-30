'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronDown, RotateCcw } from 'lucide-react';
import { KeyboardEvent, useRef, useState } from 'react';

const steps = [
  { label: 'About you', description: 'How can Amit reach you?' },
  { label: 'The project', description: 'What kind of work is this?' },
  { label: 'The brief', description: 'What should success look like?' },
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
  onChange: (value: string) => void;
};

function StyledSelect({ id, label, value, placeholder, options, required, error, onChange }: StyledSelectProps) {
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
    <div className="contact-field-label"><span>{label}</span>{required ? <b>Required</b> : <small>Optional</small>}</div>
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
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [serviceError, setServiceError] = useState('');
  const [draft, setDraft] = useState({ name: '', email: '', service: '', customService: '', budget: '', message: '' });
  const submittedService = draft.service === 'Something else' ? `Other: ${draft.customService.trim()}` : draft.service;

  function nextStep() {
    if (step === 1 && !draft.service) {
      setServiceError('Choose the option that best matches your project.');
      document.getElementById('contact-service')?.focus();
      return;
    }
    if (step === 1 && draft.service === 'Something else' && draft.customService.trim().length < 3) {
      const customService = document.getElementById('contact-custom-service') as HTMLInputElement | null;
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
      window.dispatchEvent(new CustomEvent('ak-track', { detail: { eventType: 'contact_submitted', section: String(formData.get('service') || 'Contact form') } }));
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
    <button type="button" onClick={() => { setDraft({ name: '', email: '', service: '', customService: '', budget: '', message: '' }); setState('idle'); setStep(0); }}><RotateCcw aria-hidden="true" /> Send another enquiry</button>
  </div>;

  return <form className="contact-wizard" action={submit}>
    <input type="hidden" name="name" value={draft.name} />
    <input type="hidden" name="email" value={draft.email} />
    <input type="hidden" name="service" value={submittedService} />
    <input type="hidden" name="budget" value={draft.budget} />
    <input type="hidden" name="message" value={draft.message} />
    <header className="contact-wizard-head">
      <div><span>Project brief</span><h3>{steps[step].label}</h3><p>{steps[step].description}</p></div>
      <b>{String(step + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</b>
    </header>

    <ol className="contact-wizard-progress" aria-label="Enquiry progress">
      {steps.map((item, index) => <li key={item.label} className={index === step ? 'active' : index < step ? 'complete' : ''}><span>{index < step ? <Check aria-hidden="true" /> : String(index + 1).padStart(2, '0')}</span><b>{item.label}</b><i /></li>)}
    </ol>

    <div className="contact-wizard-stage">
      <AnimatePresence mode="wait" initial={false}>
        <motion.fieldset ref={panelRef} key={step} initial={reduceMotion ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? undefined : { opacity: 0, x: -18 }} transition={{ duration: .3, ease: [0.22, 1, 0.36, 1] }}>
          {step === 0 ? <>
            <legend>First, a few details about you.</legend>
            <label htmlFor="contact-name"><span>Your name <b>Required</b></span><input id="contact-name" required maxLength={80} autoComplete="name" placeholder="How should I address you?" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
            <label htmlFor="contact-email"><span>Email address <b>Required</b></span><input id="contact-email" type="email" required maxLength={120} autoComplete="email" placeholder="you@company.com" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label>
          </> : null}
          {step === 1 ? <>
            <legend>Now, define the shape of the work.</legend>
            <StyledSelect id="contact-service" label="What can I help with?" required value={draft.service} placeholder="Select a service" error={serviceError} options={serviceOptions.map((option) => ({ value: option, label: option }))} onChange={(service) => { setDraft({ ...draft, service }); setServiceError(''); }} />
            <AnimatePresence initial={false}>
              {draft.service === 'Something else' ? <motion.label
                className="contact-custom-service"
                htmlFor="contact-custom-service"
                initial={reduceMotion ? false : { opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: .22 }}
              >
                <span>Tell me what you need <b>Required</b></span>
                <input id="contact-custom-service" required minLength={3} maxLength={70} placeholder="Describe the service or support you need" value={draft.customService} onChange={(event) => setDraft({ ...draft, customService: event.target.value })} />
              </motion.label> : null}
            </AnimatePresence>
            <StyledSelect id="contact-budget" label="Approximate budget" value={draft.budget} placeholder="Prefer not to say" options={budgetOptions} onChange={(budget) => setDraft({ ...draft, budget })} />
          </> : null}
          {step === 2 ? <>
            <legend>Describe the challenge in your own words.</legend>
            <label htmlFor="contact-message"><span>Project context <b>Required</b></span><textarea id="contact-message" required minLength={20} maxLength={3000} rows={8} placeholder="What are you building, why does it matter, and what should a successful outcome look like?" value={draft.message} onChange={(event) => setDraft({ ...draft, message: event.target.value })} /></label>
          </> : null}
        </motion.fieldset>
      </AnimatePresence>
    </div>

    <footer className="contact-wizard-actions">
      <div>
        {step > 0 ? <button className="contact-wizard-back" type="button" onClick={() => setStep((current) => current - 1)}><ArrowLeft aria-hidden="true" /> Back</button> : null}
        {step < steps.length - 1 ? <button className="contact-wizard-next" type="button" onClick={nextStep}>Continue <ArrowRight aria-hidden="true" /></button> : <button className="contact-wizard-next" disabled={state === 'sending'}>{state === 'sending' ? <><span className="contact-submit-spinner" aria-hidden="true" /> Sending</> : <>Send enquiry <ArrowUpRight aria-hidden="true" /></>}</button>}
      </div>
    </footer>
    {state === 'error' ? <p className="contact-wizard-error" role="alert">{error}</p> : null}
  </form>;
}
