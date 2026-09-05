'use client';

import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import type { ReactNode, PointerEvent } from 'react';

const MotionLink = motion.create(Link);

export default function MagneticLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 20, mass: .35 });
  const springY = useSpring(y, { stiffness: 260, damping: 20, mass: .35 });
  const move = (event: PointerEvent<HTMLAnchorElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - bounds.left - bounds.width / 2) * .16);
    y.set((event.clientY - bounds.top - bounds.height / 2) * .16);
  };
  const reset = () => { x.set(0); y.set(0); };
  return <MotionLink href={href} prefetch={false} className={className} style={{ x: springX, y: springY }} onPointerMove={move} onPointerLeave={reset} whileTap={{ scale: .97 }}>{children}</MotionLink>;
}
