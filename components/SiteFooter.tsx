import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="eyebrow">Have a project in mind?</p>
        <h2>Let&apos;s make something<br /><em>worth remembering.</em></h2>
        <Link href="/contact" className="button button-primary">Start a conversation <span>↗</span></Link>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Amit Kumar</span>
        <div>
          <a href="https://www.linkedin.com/in/amit864kumar/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://github.com/amit864kum" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.instagram.com/amit_864kumar" target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </div>
    </footer>
  );
}
