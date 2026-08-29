'use client';
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
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={`Switch to ${nextTheme} mode`} aria-pressed={theme === 'light'} title={`Switch to ${nextTheme} mode`}>
      <span className="theme-toggle-thumb" aria-hidden="true" />
      <span className="theme-toggle-option theme-toggle-light" aria-hidden="true"><i /><b>Light</b></span>
      <span className="theme-toggle-option theme-toggle-dark" aria-hidden="true"><i /><b>Dark</b></span>
    </button>
  );
}
