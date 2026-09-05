'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, MailCheck } from 'lucide-react';

type Step = 'request' | 'verify' | 'success';
type ApiResult = { error?: string; destination?: string };

async function postJson(url: string, body: Record<string, FormDataEntryValue | string>) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({})) as ApiResult;
    return { response, data };
  } catch {
    return { response: null, data: { error: 'Could not reach the server. Check that the site is running and try again.' } as ApiResult };
  }
}

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>('request');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [destination, setDestination] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  async function requestCode() {
    setBusy(true); setMessage('');
    const { response, data } = await postJson('/api/admin/password/forgot', {});
    setBusy(false);
    if (!response?.ok) return setMessage(data.error || 'Could not send a verification code.');
    setDestination(data.destination || 'your admin email'); setStep('verify');
  }

  async function reset(formData: FormData) {
    setMessage('');
    const password = String(formData.get('password') || '');
    if (password !== formData.get('confirmPassword')) return setMessage('The passwords do not match.');
    setBusy(true);
    const { response, data } = await postJson('/api/admin/password/reset', { code: formData.get('code') || '', password });
    setBusy(false);
    if (!response?.ok) return setMessage(data.error || 'Could not reset the password.');
    setStep('success');
  }

  async function resendCode() {
    setBusy(true); setMessage('');
    const { response, data } = await postJson('/api/admin/password/forgot', {});
    setBusy(false);
    if (!response?.ok) return setMessage(data.error || 'Could not send another verification code.');
    setDestination(data.destination || destination || 'your admin email');
    setMessage('A new verification code has been requested.');
  }

  if (step === 'success') return <section className="admin-login-form studio-recovery-success"><CheckCircle2 aria-hidden="true" /><span>Password updated</span><h1>You&apos;re secure again.</h1><p>Your new password is active. Previous admin sessions and reset codes are no longer valid.</p><Link className="admin-primary" href="/admin/login">Return to sign in</Link></section>;
  return <form className="admin-login-form studio-recovery-form" action={step === 'request' ? requestCode : reset}>
    <div><span>{step === 'request' ? 'Account recovery' : 'Check your inbox'}</span><h1>{step === 'request' ? 'Reset access.' : 'Enter your code.'}</h1><p>{step === 'request' ? 'We will send a single-use verification code to the protected admin email.' : `If recovery is available, a six-digit code was sent to ${destination}. It expires in 10 minutes.`}</p></div>
    {step === 'request' ? null : <>
      <div className="studio-mail-sent"><MailCheck aria-hidden="true" /> Email delivery requested</div>
      <label>Verification code<input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required autoFocus /></label>
      <label>New password<span className="studio-password-field"><input name="password" type={showPasswords ? 'text' : 'password'} autoComplete="new-password" minLength={12} maxLength={128} required /><button type="button" onClick={() => setShowPasswords((visible) => !visible)} aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'} aria-pressed={showPasswords}>{showPasswords ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</button></span><small>12+ characters with uppercase, lowercase, and a number.</small></label>
      <label>Confirm password<input name="confirmPassword" type={showPasswords ? 'text' : 'password'} autoComplete="new-password" minLength={12} required /></label>
    </>}
    <button className="admin-primary" disabled={busy}>{busy ? 'Please wait…' : step === 'request' ? 'Send verification code' : 'Reset password'}</button>
    {message ? <p className="login-error" role="alert">{message}</p> : null}
    <div className="studio-auth-links">{step === 'verify' ? <><button type="button" disabled={busy} onClick={resendCode}>Send another code</button><button type="button" onClick={() => { setStep('request'); setMessage(''); }}>Start over</button></> : null}<Link href="/admin/login">Back to sign in</Link></div>
  </form>;
}
