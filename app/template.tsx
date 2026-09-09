'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

export default function Template({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="page-transition"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : .42, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.i
        className="page-transition__line"
        aria-hidden="true"
        initial={reduceMotion ? false : { scaleX: 0, opacity: 1 }}
        animate={reduceMotion ? undefined : { scaleX: 1, opacity: 0 }}
        transition={{ scaleX: { duration: .48, ease: [0.65, 0, 0.35, 1] }, opacity: { duration: .18, delay: .42 } }}
      />
      {children}
    </motion.div>
  );
}
