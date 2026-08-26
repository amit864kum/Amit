import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function SiteHeader({ solid = false }: { solid?: boolean }) {
  return (
    <header className={'site-header ' + (solid ? 'header-solid' : '')}>
      <Link href="/" className="brand" aria-label="Amit Kumar home">
        <Image src="/ak-mark.png" alt="" width={44} height={44} priority />
        <span>Amit Kumar</span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/work">Work</Link><Link href="/about">About</Link><Link href="/blog">Journal</Link>
      </nav>
      <div className="header-actions">
        <ThemeToggle />
        <Link href="/contact" className="nav-cta">Let&apos;s talk <span>↗</span></Link>
      </div>
    </header>
  );
}
