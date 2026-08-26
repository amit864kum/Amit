import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import PremiumMotion from '@/components/PremiumMotion';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PremiumMotion>{children}</PremiumMotion>
      </body>
    </html>
  );
}
