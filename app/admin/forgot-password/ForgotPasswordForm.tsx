'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2, KeyRound, MailCheck } from 'lucide-react';

type Step = 'request' | 'verify' | 'success';

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>('request');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [destination, setDestination] = useState('');
  const [previewCode, setPreviewCode] = useState('');

  async function requestCode(formData: FormData) {
    setBusy(true); setMessage('');
    const response = await fetch('/api/admin/password/forgot', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ identifier: formData.get('identifier') }) });
    const data = await response.json() as { error?: string; destination?: string; previewCode?: string };
    setBusy(false);
    if (!response.ok) return setMessage(data.error || 'Could not send a verification code.');
    setDestination(data.destination || 'your admin email'); setPreviewCode(data.previewCode || ''); setStep('verify');
  }

  async function reset(formData: FormData) {
    setMessage('');
    const password = String(formData.get('password') || '');
    if (password !== formData.get('confirmPassword')) return setMessage('The passwords do not match.');
    setBusy(true);
    const response = await fetch('/api/admin/password/reset', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: formData.get('code'), password }) });
    const data = await response.json() as { error?: string };
    setBusy(false);
    if (!response.ok) return setMessage(data.error || 'Could not reset the password.');
    setStep('success');
  }

  if (step === 'success') return <section className="admin-login-form studio-recovery-success"><CheckCircle2 aria-hidden="true" /><span>Password updated</span><h1>You&apos;re secure again.</h1><p>Your new password is active. Previous admin sessions remain short-lived and the reset code cannot be reused.</p><Link className="admin-primary" href="/admin/login">Return to sign in</Link></section>;
  return <form className="admin-login-form studio-recovery-form" action={step === 'request' ? requestCode : reset}>
    <div><span>{step === 'request' ? 'Account recovery' : 'Check your inbox'}</span><h1>{step === 'request' ? 'Reset access.' : 'Enter your code.'}</h1><p>{step === 'request' ? 'We will send a single-use verification code to the protected admin email.' : `A six-digit code was sent to ${destination}. It expires in 10 minutes.`}</p></div>
    {step === 'request' ? <label>Username or email<input name="identifier" autoComplete="username" required autoFocus /></label> : <>
      {previewCode ? <div className="studio-dev-code"><KeyRound aria-hidden="true" /><div><small>Local development code</small><strong>{previewCode}</strong></div></div> : <div className="studio-mail-sent"><MailCheck aria-hidden="true" /> Email delivery requested</div>}
      <label>Verification code<input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required autoFocus /></label>
      <label>New password<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /><small>12+ characters with uppercase, lowercase, and a number.</small></label>
      <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} required /></label>
    </>}
    <button className="admin-primary" disabled={busy}>{busy ? 'Please wait…' : step === 'request' ? 'Send verification code' : 'Reset password'}</button>
    {message ? <p className="login-error" role="alert">{message}</p> : null}
    <div className="studio-auth-links">{step === 'verify' ? <button type="button" onClick={() => { setStep('request'); setMessage(''); }}>Use another account</button> : null}<Link href="/admin/login">Back to sign in</Link></div>
  </form>;
}
