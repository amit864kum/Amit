import { env } from 'cloudflare:workers';
import { requireAdminPage } from '@/lib/admin';
import { ensureContentTables, getPosts, getProjects } from '@/lib/content';
import AdminClient from './AdminClient';
import type { AdminMessage } from './AdminClient';

export const dynamic = 'force-dynamic';
export default async function AdminPage() {
  await requireAdminPage();
  await ensureContentTables();
  const [projects, posts, messageResult] = await Promise.all([
    getProjects(), getPosts(true),
    env.DB.prepare('SELECT id,name,email,service,budget,message,created_at AS createdAt,status FROM contact_messages ORDER BY created_at DESC').all<AdminMessage>(),
  ]);
  return <AdminClient projects={projects} posts={posts} messages={messageResult.results} />;
}
