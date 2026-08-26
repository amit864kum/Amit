import { redirect } from 'next/navigation';
import { isAdminSession } from '@/lib/admin';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';
export default async function AdminLoginPage() {
  if (await isAdminSession()) redirect('/admin');
  return <main className="admin-login-page"><div className="admin-login-mark">AK</div><LoginForm /></main>;
}
