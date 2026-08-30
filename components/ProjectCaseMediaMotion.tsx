'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

export default function ProjectCaseMediaMotion({ children }: { children: ReactNode }) {
  const target = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, .5, 1], [54, 0, -48]);
  const rotateX = useTransform(scrollYProgress, [0, .5, 1], [3.5, 0, -2]);
  const scale = useTransform(scrollYProgress, [0, .5, 1], [.965, 1, .985]);

  return <div className="project-case-media-perspective" ref={target}>
    <motion.div className="project-case-media-motion" style={reduceMotion ? undefined : { y, rotateX, scale }}>{children}</motion.div>
  </div>;
}
