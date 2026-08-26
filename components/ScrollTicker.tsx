'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function ScrollTicker({ items }: { items: string[] }) {
  const section = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], ['4%', '-18%']);
  return (
    <section ref={section} className="scroll-ticker" aria-label="Core capabilities">
      <motion.div style={reduceMotion ? undefined : { x }}>
        {[...items, ...items].map((item, index) => <span key={`${item}-${index}`} aria-hidden={index >= items.length}>{item}<i aria-hidden="true" /></span>)}
      </motion.div>
    </section>
  );
}
