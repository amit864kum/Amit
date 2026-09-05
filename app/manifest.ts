import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Amit Kumar Portfolio',
    short_name: 'Amit Kumar',
    description: 'Full-stack, blockchain, and product engineering portfolio of Amit Kumar in Patna, India.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0d13',
    theme_color: '#6f5cff',
    lang: 'en-IN',
    icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
