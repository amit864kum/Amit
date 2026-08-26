import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import PremiumMotion from '@/components/PremiumMotion';
import './globals.css';
import './premium.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
  title: 'Amit Kumar — Full-Stack Developer & Blockchain Engineer',
  description:
    'Portfolio of Amit Kumar, a full-stack developer and blockchain engineer building scalable, high-impact digital products.',
  openGraph: {
    title: 'Amit Kumar — Full-Stack Developer & Blockchain Engineer',
    description: 'Scalable, high-impact digital products built with thoughtful design and dependable code.',
    type: 'website',
    images: [{ url: '/og.png', width: 1731, height: 909, alt: 'Amit Kumar — Full-Stack Developer & Blockchain Engineer' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amit Kumar — Full-Stack Developer & Blockchain Engineer',
    description: 'Scalable, high-impact digital products built with thoughtful design and dependable code.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const saved = localStorage.getItem('amit-theme'); const theme = saved === 'light' || saved === 'dark' ? saved : (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'); document.documentElement.dataset.theme = theme; } catch { document.documentElement.dataset.theme = 'dark'; } })();`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
      >
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <PremiumMotion>{children}</PremiumMotion>
      </body>
    </html>
  );
}
