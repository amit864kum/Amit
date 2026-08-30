import { redirect } from 'next/navigation';
import { isAdminSession } from '@/lib/admin';
import ForgotPasswordForm from './ForgotPasswordForm';

export const dynamic = 'force-dynamic';
export default async function ForgotPasswordPage() {
  if (await isAdminSession()) redirect('/admin');
  return <main className="admin-login-page studio-auth-page"><div className="admin-login-mark"><span>AK</span><small>Secure recovery</small></div><ForgotPasswordForm /></main>;
}
