import { redirect } from 'next/navigation';
import { isAdminSession } from '@/lib/admin';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';
export default async function AdminLoginPage() {
  if (await isAdminSession()) redirect('/admin');
  return <main className="admin-login-page"><div className="admin-login-mark studio-login-intro"><span>AK</span><div><small>Portfolio studio</small><strong>One workspace for every public detail.</strong><p>Shape projects, publish articles, and respond to opportunities from a focused private console.</p></div></div><LoginForm /></main>;
}
