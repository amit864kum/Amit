import { ExternalLink } from 'lucide-react';
import { requireAdminPage } from '@/lib/admin';
import { getAdminCounts } from '@/lib/admin-data';
import { getProjectCount, getResumeSettings } from '@/lib/content';
import AdminShell from '../_components/AdminShell';
import ResumeManager from './ResumeManager';

export const dynamic = 'force-dynamic';

export default async function AdminResumePage() {
  await requireAdminPage();
  const [counts, resume, projectCount] = await Promise.all([
    getAdminCounts(),
    getResumeSettings(),
    getProjectCount(),
  ]);
  return <AdminShell
    counts={counts}
    eyebrow="Public profile"
    title="Resume"
    description="Replace the downloadable résumé and control how its action appears on the About page. Your project total stays synchronized automatically."
    actions={<a className="studio-primary-action" href="/about" target="_blank">View About page <ExternalLink aria-hidden="true" /></a>}
  >
    <ResumeManager resume={resume} projectCount={projectCount} />
  </AdminShell>;
}
