import Link from 'next/link';
import MagneticLink from './MagneticLink';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-orbit" aria-hidden="true"><span>AK</span></div>
      <div className="footer-cta">
        <div><p className="eyebrow">Have a serious project in mind?</p><span className="footer-status"><i /> Accepting select collaborations</span></div>
        <h2>Let&apos;s build something<br /><em>impossible to ignore.</em></h2>
        <div className="footer-actions"><MagneticLink href="/contact" className="button button-primary">Start a conversation <span>↗</span></MagneticLink><a href="mailto:amitkumarabhinav59@gmail.com">amitkumarabhinav59@gmail.com</a></div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Amit Kumar · Patna, India</span>
        <div>
          <Link href="/projects" prefetch={false}>Projects</Link><Link href="/about" prefetch={false}>About</Link><Link href="/blog" prefetch={false}>Blog</Link>
          <a href="https://www.linkedin.com/in/amit864kumar/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://github.com/amit864kum" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.instagram.com/amit_864kumar" target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </div>
    </footer>
  );
}
