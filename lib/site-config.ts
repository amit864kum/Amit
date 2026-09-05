import { siteUrl } from '@/lib/env';

export const siteConfig = {
  name: 'Amit Kumar',
  title: 'Amit Kumar — Full-Stack & Blockchain Developer in Patna',
  description:
    'Portfolio of Amit Kumar, a freelance full-stack and blockchain developer in Patna building dependable web products, research platforms, and scalable digital systems.',
  email: 'amitkumarabhinav59@gmail.com',
  location: 'Patna, Bihar, India',
  linkedIn: 'https://www.linkedin.com/in/amit864kumar/',
  github: 'https://github.com/amit864kum',
  instagram: 'https://www.instagram.com/amit_864kumar',
  keywords: [
    'Amit Kumar',
    'Amit Kumar portfolio',
    'web developer in Patna',
    'freelance web developer in Patna',
    'full-stack developer in Patna',
    'blockchain developer in Patna',
  ],
} as const;

export function absoluteUrl(path = '/') {
  return new URL(path, siteUrl()).toString();
}
