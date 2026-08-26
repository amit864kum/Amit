'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export default function ScrollScene({ className, children }: { className: string; children: ReactNode }) {
  const scene = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = scene.current;
    if (!node) return;
    let frame = 0;
    const updateScroll = () => {
      frame = 0;
      const top = node.getBoundingClientRect().top + window.scrollY;
      const progress = Math.min(1, Math.max(0, (window.scrollY - top) / Math.max(node.offsetHeight - window.innerHeight, window.innerHeight)));
      node.style.setProperty('--scene-scroll', progress.toFixed(4));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(updateScroll); };
    const pointer = (event: PointerEvent) => {
      const bounds = node.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
      node.style.setProperty('--scene-x', x.toFixed(3));
      node.style.setProperty('--scene-y', y.toFixed(3));
    };
    const reset = () => { node.style.setProperty('--scene-x', '0'); node.style.setProperty('--scene-y', '0'); };
    updateScroll();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    node.addEventListener('pointermove', pointer);
    node.addEventListener('pointerleave', reset);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      node.removeEventListener('pointermove', pointer);
      node.removeEventListener('pointerleave', reset);
    };
  }, []);

  return <section ref={scene} className={className}>{children}</section>;
}
