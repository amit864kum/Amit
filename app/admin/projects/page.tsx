import { Plus } from 'lucide-react';
import { requireAdminPage } from '@/lib/admin';
import { getAdminCounts } from '@/lib/admin-data';
import { getAdminProjects } from '@/lib/content';
import AdminShell from '../_components/AdminShell';
import ProjectsManager from './ProjectsManager';

export const dynamic = 'force-dynamic';
export default async function AdminProjectsPage() {
  await requireAdminPage();
  const [counts, projects] = await Promise.all([getAdminCounts(), getAdminProjects()]);
  return <AdminShell counts={counts} eyebrow="Case study library" title="Projects" description="Curate the work that proves your range, judgement, and technical depth." actions={<a className="studio-primary-action" href="#project-editor"><Plus /> Add project</a>}>
    <ProjectsManager key={JSON.stringify(projects)} projects={projects} />
  </AdminShell>;
}
