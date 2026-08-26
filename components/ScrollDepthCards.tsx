'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export default function ScrollDepthCards({ children }: { children: ReactNode }) {
  const rail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = rail.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const center = window.innerHeight / 2;
      node.querySelectorAll<HTMLElement>('[data-scroll-card]').forEach((card) => {
        const bounds = card.getBoundingClientRect();
        const distance = Math.max(-1, Math.min(1, (bounds.top + bounds.height / 2 - center) / window.innerHeight));
        card.style.setProperty('--card-distance', distance.toFixed(4));
        card.style.setProperty('--card-depth', Math.abs(distance).toFixed(4));
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', schedule); removeEventListener('resize', schedule); };
  }, []);
  return <div ref={rail} className="experience-cards">{children}</div>;
}
