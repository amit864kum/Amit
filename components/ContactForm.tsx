'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  async function submit(formData: FormData) {
    setState('sending');
    const response = await fetch('/api/contact', { method: 'POST', body: formData });
    setState(response.ok ? 'sent' : 'error');
  }
  if (state === 'sent') return <div className="form-success"><strong>Thank you.</strong><p>Your message is in. Amit will reply soon.</p></div>;
  return (
    <form className="contact-form" action={submit}>
      <label>Name<input name="name" required maxLength={80} placeholder="Your name" /></label>
      <label>Email<input name="email" type="email" required maxLength={120} placeholder="you@company.com" /></label>
      <label>What can I help with?<select name="service" required defaultValue=""><option value="" disabled>Select a service</option><option>Full-stack development</option><option>Blockchain product</option><option>Portfolio or brand website</option><option>Technical consulting</option><option>Something else</option></select></label>
      <label>Approximate budget<select name="budget" defaultValue=""><option value="">Prefer not to say</option><option>Under ₹50,000</option><option>₹50,000–₹1,50,000</option><option>₹1,50,000+</option></select></label>
      <label className="full">Project details<textarea name="message" required minLength={20} maxLength={3000} rows={6} placeholder="Tell me about the goal, timeline, and what success looks like." /></label>
      <button className="button button-primary" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send enquiry ↗'}</button>
      {state === 'error' && <p role="alert">Something went wrong. Please email Amit directly.</p>}
    </form>
  );
}
