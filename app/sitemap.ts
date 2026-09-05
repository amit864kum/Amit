import type { MetadataRoute } from 'next';
import { getPosts, getProjects } from '@/lib/content';
import { absoluteUrl } from '@/lib/site-config';
import { toProjectSlug } from '@/lib/slug';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const core: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'monthly', priority: 1 },
    { url: absoluteUrl('/about'), changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/projects'), changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/blog'), changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/contact'), changeFrequency: 'yearly', priority: 0.7 },
  ];
  try {
    const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
    return [
      ...core,
      ...projects.filter((project) => project.destination === 'case_study').map((project) => ({
        url: absoluteUrl(`/projects/${toProjectSlug(project.slug || project.title)}`),
        lastModified: new Date(`${project.year}-01-01T00:00:00.000Z`),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
      ...posts.map((post) => ({
        url: absoluteUrl(`/blog/${post.slug}`),
        lastModified: new Date(post.publishedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return core;
  }
}
