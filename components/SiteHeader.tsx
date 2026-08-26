'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import MagneticLink from './MagneticLink';

const navigation = [{ href: '/work', label: 'Work' }, { href: '/about', label: 'About' }, { href: '/blog', label: 'Journal' }];

export default function SiteHeader({ solid = false }: { solid?: boolean }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  return (
    <motion.header className={'site-header ' + (solid ? 'header-solid' : '')} initial={reduceMotion ? false : { y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .7, ease: [0.22, 1, 0.36, 1] }}>
      <Link href="/" className="brand" aria-label="Amit Kumar home">
        <span className="brand-mark"><Image src="/ak-mark.png" alt="" width={44} height={44} priority /></span>
        <span className="brand-copy"><b>Amit Kumar</b><small>Developer · Designer</small></span>
      </Link>
      <nav aria-label="Primary navigation">
        {navigation.map((item) => { const active = pathname === item.href || pathname.startsWith(item.href + '/'); return <Link href={item.href} key={item.href} className={active ? 'active' : ''}><span>{item.label}</span>{active && <motion.i layoutId="active-navigation" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}</Link>; })}
      </nav>
      <div className="header-actions">
        <span className="availability"><i /> Available</span>
        <ThemeToggle />
        <MagneticLink href="/contact" className="nav-cta">Let&apos;s talk <span>↗</span></MagneticLink>
      </div>
    </motion.header>
  );
}
