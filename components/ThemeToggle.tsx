'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem('amit-theme') === 'light';
    setLight(saved);
    document.documentElement.dataset.theme = saved ? 'light' : 'dark';
  }, []);
  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.dataset.theme = next ? 'light' : 'dark';
    localStorage.setItem('amit-theme', next ? 'light' : 'dark');
  }
  return <button type="button" className="theme-toggle" onClick={toggle} aria-label={'Use ' + (light ? 'dark' : 'light') + ' theme'}>{light ? '◐' : '◑'}</button>;
}
