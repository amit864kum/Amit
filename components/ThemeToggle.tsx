'use client';
import { Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'dark');

  function toggle() {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('amit-theme', next);
  }

  const nextTheme = theme === 'light' ? 'dark' : 'light';
  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={`Switch to ${nextTheme} mode`} aria-pressed={theme === 'dark'} title={`Switch to ${nextTheme} mode`}>
      {theme === 'light'
        ? <Moon className="theme-toggle-icon" aria-hidden="true" strokeWidth={1.8} />
        : <Sun className="theme-toggle-icon" aria-hidden="true" strokeWidth={1.8} />}
    </button>
  );
}
