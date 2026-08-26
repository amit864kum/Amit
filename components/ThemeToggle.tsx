'use client';

export default function ThemeToggle() {
  function toggle() {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('amit-theme', next);
  }
  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label="Toggle light and dark mode">
      <span className="theme-toggle-track" aria-hidden="true">
        <i className="theme-icon-sun" />
        <i className="theme-icon-moon" />
        <b className="theme-toggle-thumb" />
      </span>
    </button>
  );
}
