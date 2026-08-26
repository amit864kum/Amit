'use client';

import { useRef, type PointerEvent, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, type MotionStyle } from 'framer-motion';

export default function ScrollScene({ className, children }: { className: string; children: ReactNode }) {
  const scene = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 120, damping: 22, mass: .35 });
  const smoothY = useSpring(pointerY, { stiffness: 120, damping: 22, mass: .35 });
  const { scrollYProgress } = useScroll({ target: scene, offset: ['start start', 'end start'] });
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: .28 });
  const move = (event: PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - .5) * 2);
    pointerY.set(((event.clientY - bounds.top) / bounds.height - .5) * 2);
  };
  const reset = () => { pointerX.set(0); pointerY.set(0); };
  const sceneStyle = {
    '--scene-scroll': reduceMotion ? 0 : smoothScroll,
    '--scene-x': reduceMotion ? 0 : smoothX,
    '--scene-y': reduceMotion ? 0 : smoothY,
  } as unknown as MotionStyle;
  return <motion.section ref={scene} className={className} style={sceneStyle} onPointerMove={move} onPointerLeave={reset}>{children}</motion.section>;
}
