'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  async function login(formData: FormData) {
    setState('loading');
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: formData.get('username'), password: formData.get('password') }),
    });
    if (!response.ok) return setState('error');
    router.replace('/admin');
    router.refresh();
  }
  return (
    <form className="admin-login-form" action={login}>
      <div><span>Private workspace</span><h1>Welcome back.</h1><p>Sign in to manage projects, articles, and enquiries.</p></div>
      <label>Username<input name="username" autoComplete="username" required /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
      <button className="admin-primary" disabled={state === 'loading'}>{state === 'loading' ? 'Signing in…' : 'Sign in'}</button>
      {state === 'error' && <p className="login-error" role="alert">The username or password is incorrect.</p>}
      <Link href="/">← Return to portfolio</Link>
    </form>
  );
}
