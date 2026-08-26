'use client';

export default function ThemeToggle() {
  function toggle() {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('amit-theme', next);
  }
  return <button type="button" className="theme-toggle" onClick={toggle} aria-label="Toggle color theme"><span className="theme-sun" aria-hidden="true">☀</span><span className="theme-moon" aria-hidden="true">☾</span></button>;
}
