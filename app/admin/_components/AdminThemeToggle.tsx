'use client';

import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';

type AdminTheme = 'light' | 'dark';

export default function AdminThemeToggle({ initialTheme }: { initialTheme: AdminTheme }) {
  const [theme, setTheme] = useState<AdminTheme>(initialTheme);
  const toggle = () => {
    const next: AdminTheme = theme === 'dark' ? 'light' : 'dark';
    const root = document.querySelector<HTMLElement>('.admin-theme');
    if (root) root.dataset.adminTheme = next;
    document.cookie = `admin-theme=${next}; Path=/admin; Max-Age=31536000; SameSite=Lax`;
    setTheme(next);
  };
  const next = theme === 'dark' ? 'light' : 'dark';
  return <button className="admin-theme-toggle" type="button" onClick={toggle} aria-label={`Switch admin panel to ${next} mode`} title={`Switch to ${next} mode`}>
    {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
  </button>;
}
