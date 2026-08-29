'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const navigation = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/work', label: 'Projects' },
  { href: '/contact', label: 'Contact' },
  { href: '/blog', label: 'Blog' },
];

export default function SiteHeader({ solid = false }: { solid?: boolean }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  return (
    <motion.header className={'site-header ' + (solid ? 'header-solid' : '')} initial={reduceMotion ? false : { y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .7, ease: [0.22, 1, 0.36, 1] }}>
      <Link href="/" className="brand" aria-label="Amit Kumar home">
        <span className="brand-mark"><Image src="/ak-mark.png" alt="" width={44} height={44} priority /></span>
      </Link>
      <nav aria-label="Primary navigation">
        {navigation.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
          return <Link href={item.href} key={item.href} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined}><span>{item.label}</span>{active && <motion.i layoutId="active-navigation" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}</Link>;
        })}
      </nav>
      <div className="header-actions">
        <ThemeToggle />
      </div>
    </motion.header>
  );
}
