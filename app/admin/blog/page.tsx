import { FilePlus2 } from 'lucide-react';
import { requireAdminPage } from '@/lib/admin';
import { getAdminCounts } from '@/lib/admin-data';
import { getPosts } from '@/lib/content';
import AdminShell from '../_components/AdminShell';
import BlogManager from './BlogManager';

export const dynamic = 'force-dynamic';
export default async function AdminBlogPage() {
  await requireAdminPage();
  const [counts, posts] = await Promise.all([getAdminCounts(), getPosts(true)]);
  return <AdminShell counts={counts} eyebrow="Publishing studio" title="Blog" description="Turn engineering decisions and research into useful, credible writing." actions={<a className="studio-primary-action" href="#post-editor"><FilePlus2 /> New article</a>}><BlogManager posts={posts} /></AdminShell>;
}
