import { env } from 'cloudflare:workers';
import { requireAdminPage } from '@/lib/admin';
import { getAdminCounts } from '@/lib/admin-data';
import { ensureContentTables } from '@/lib/content';
import AdminShell from '../_components/AdminShell';
import EnquiriesManager, { type Enquiry } from './EnquiriesManager';

export const dynamic = 'force-dynamic';
export default async function AdminEnquiriesPage() {
  await requireAdminPage(); await ensureContentTables();
  const [counts, result] = await Promise.all([getAdminCounts(), env.DB.prepare('SELECT id,name,email,service,budget,message,created_at AS createdAt,status FROM contact_messages ORDER BY created_at DESC').all<Enquiry>()]);
  return <AdminShell counts={counts} eyebrow="Opportunity inbox" title="Enquiries" description="Qualify conversations, understand demand, and keep promising opportunities moving."><EnquiriesManager enquiries={result.results} /></AdminShell>;
}
