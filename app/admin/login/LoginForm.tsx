'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  async function login(formData: FormData) {
    setState('loading');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: formData.get('username'), password: formData.get('password') }),
      });
      if (!response.ok) return setState('error');
      router.replace('/admin');
      router.refresh();
    } catch { setState('error'); }
  }
  return (
    <form className="admin-login-form" action={login}>
      <div className="studio-auth-heading"><span><LockKeyhole aria-hidden="true" /> Private workspace</span><h1>Welcome back.</h1><p>Sign in to manage projects, articles, and enquiries.</p></div>
      <label htmlFor="admin-username">Username<input id="admin-username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required /></label>
      <label htmlFor="admin-password">Password<span className="studio-password-field"><input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required aria-describedby={state === 'error' ? 'login-error' : undefined} /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>{showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</button></span></label>
      <button className="admin-primary" disabled={state === 'loading'} aria-busy={state === 'loading'}>{state === 'loading' ? 'Signing in…' : 'Sign in securely'}</button>
      {state === 'error' && <p id="login-error" className="login-error" role="alert">The username or password is incorrect. Check both fields and try again.</p>}
      <div className="studio-auth-links"><Link href="/admin/forgot-password">Forgot password?</Link><Link href="/">Return to portfolio</Link></div>
    </form>
  );
}
