import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import AdminThemeToggle from './_components/AdminThemeToggle';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin Studio',
  robots: { index: false, follow: false, noarchive: true, nocache: true },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const saved = (await cookies()).get('admin-theme')?.value;
  const theme = saved === 'dark' ? 'dark' : 'light';
  return <div className="admin-theme" data-admin-theme={theme}>
    <AdminThemeToggle initialTheme={theme} />
    {children}
  </div>;
}
