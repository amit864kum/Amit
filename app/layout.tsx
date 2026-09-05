import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { headers } from 'next/headers';
import PremiumMotion from '@/components/PremiumMotion';
import { config, siteUrl } from '@/lib/env';
import { siteConfig } from '@/lib/site-config';
import './globals.css';
import './premium.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  applicationName: 'Amit Kumar Portfolio',
  title: { default: siteConfig.title, template: '%s | Amit Kumar' },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords, 'software developer', 'product engineer', 'IIT Patna developer'],
  authors: [{ name: siteConfig.name, url: '/' }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: 'technology',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg', apple: '/favicon.svg' },
  verification: { google: config('GOOGLE_SITE_VERIFICATION') || undefined },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    type: 'website',
    url: '/',
    siteName: 'Amit Kumar Portfolio',
    locale: 'en_IN',
    images: [{ url: '/og-social.jpg', width: 1200, height: 630, alt: 'Amit Kumar, full-stack and blockchain developer in Patna' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: ['/og-social.jpg'],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get('x-csp-nonce') || undefined;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          suppressHydrationWarning
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
