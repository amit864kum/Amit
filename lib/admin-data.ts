import { ensureContentTables } from '@/lib/content';
import { toProjectSlug } from '@/lib/slug';
import { database } from '@/db';

export type AdminCounts = {
  projects: number;
  featuredProjects: number;
  posts: number;
  publishedPosts: number;
  drafts: number;
  enquiries: number;
  newEnquiries: number;
};

export type DashboardContentItem = {
  id: number;
  title: string;
  meta: string;
  kind: 'project' | 'post';
  href: string;
};

export type DashboardEnquiry = {
  id: number;
  name: string;
  email: string;
  contactDetails: string;
  service: string;
  status: string;
  createdAt: string;
};

export async function getAdminCounts(): Promise<AdminCounts> {
  await ensureContentTables();
  const db = database;
  const [projects, posts, enquiries] = await Promise.all([
    db.prepare('SELECT COUNT(*)::int AS total, COALESCE(SUM(CASE WHEN featured=1 THEN 1 ELSE 0 END),0)::int AS featured FROM projects').first<{ total: number; featured: number | null }>(),
    db.prepare('SELECT COUNT(*)::int AS total, COALESCE(SUM(CASE WHEN published=1 THEN 1 ELSE 0 END),0)::int AS published FROM posts').first<{ total: number; published: number | null }>(),
    db.prepare("SELECT COUNT(*)::int AS total, COALESCE(SUM(CASE WHEN status='new' THEN 1 ELSE 0 END),0)::int AS fresh FROM contact_messages").first<{ total: number; fresh: number | null }>(),
  ]);
  const postTotal = Number(posts?.total || 0);
  const published = Number(posts?.published || 0);
  return {
    projects: Number(projects?.total || 0),
    featuredProjects: Number(projects?.featured || 0),
    posts: postTotal,
    publishedPosts: published,
    drafts: Math.max(0, postTotal - published),
    enquiries: Number(enquiries?.total || 0),
    newEnquiries: Number(enquiries?.fresh || 0),
  };
}

export async function getDashboardContent() {
  await ensureContentTables();
  const db = database;
  const [projectRows, postRows, enquiryRows] = await Promise.all([
    db.prepare('SELECT id,title,category,year,slug FROM projects ORDER BY updated_at DESC,id DESC LIMIT 3').all<{ id: number; title: string; category: string; year: string; slug: string }>(),
    db.prepare('SELECT id,title,category,published_at AS "publishedAt",published,slug FROM posts ORDER BY updated_at DESC,id DESC LIMIT 3').all<{ id: number; title: string; category: string; publishedAt: string; published: number; slug: string }>(),
    db.prepare("SELECT id,name,email,COALESCE(NULLIF(contact_details,''),message) AS \"contactDetails\",service,status,created_at AS \"createdAt\" FROM contact_messages ORDER BY created_at DESC LIMIT 4").all<DashboardEnquiry>(),
  ]);
  const content: DashboardContentItem[] = [
    ...projectRows.results.map((item) => ({ id: item.id, title: item.title, meta: `${item.category} · ${item.year}`, kind: 'project' as const, href: `/projects/${toProjectSlug(item.slug || item.title)}` })),
    ...postRows.results.map((item) => ({ id: item.id, title: item.title, meta: `${item.category} · ${item.published ? 'Published' : 'Draft'}`, kind: 'post' as const, href: `/blog/${item.slug}` })),
  ].slice(0, 5);
  return { content, enquiries: enquiryRows.results };
}
