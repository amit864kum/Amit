import { requireAdminPage } from '@/lib/admin';
import { database } from '@/db';
import { getAdminCounts } from '@/lib/admin-data';
import { ensureContentTables } from '@/lib/content';
import AdminShell from '../_components/AdminShell';
import EnquiriesManager, { type Enquiry } from './EnquiriesManager';

export const dynamic = 'force-dynamic';
export default async function AdminEnquiriesPage() {
  await requireAdminPage(); await ensureContentTables();
  const [counts, result] = await Promise.all([getAdminCounts(), database.prepare("SELECT id,name,email,COALESCE(NULLIF(contact_details,''),message) AS \"contactDetails\",created_at AS \"createdAt\",status FROM contact_messages ORDER BY created_at DESC").all<Enquiry>()]);
  return <AdminShell counts={counts} eyebrow="Contact inbox" title="Enquiries" description="Review contact details and keep conversations moving."><EnquiriesManager enquiries={result.results} /></AdminShell>;
}
