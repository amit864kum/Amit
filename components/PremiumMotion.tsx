'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring } from 'framer-motion';

export default function PremiumMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 130, damping: 28, mass: .2 });
  const cursorX = useMotionValue(-120);
  const cursorY = useMotionValue(-120);
  const glowX = useSpring(cursorX, { stiffness: 70, damping: 24, mass: .35 });
  const glowY = useSpring(cursorY, { stiffness: 70, damping: 24, mass: .35 });

  useEffect(() => {
    if (reduceMotion || matchMedia('(pointer: coarse)').matches) return;
    const move = (event: PointerEvent) => { cursorX.set(event.clientX - 220); cursorY.set(event.clientY - 220); };
    addEventListener('pointermove', move, { passive: true });
    return () => removeEventListener('pointermove', move);
  }, [cursorX, cursorY, reduceMotion]);

  return (
    <>
      <motion.div className="global-progress" style={{ scaleX: progress }} />
      {!reduceMotion ? <motion.div className="cursor-aurora" style={{ x: glowX, y: glowY }} aria-hidden="true" /> : null}
      <div className="ambient-grid" aria-hidden="true" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          id="main-content"
          tabIndex={-1}
          className="route-stage"
          key={pathname}
          initial={false}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -10, filter: 'blur(5px)' }}
          transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }}
        >{children}</motion.div>
      </AnimatePresence>
    </>
  );
}
