import { getChatGPTUser, requireChatGPTUser } from '@/app/chatgpt-auth';

const ADMIN_EMAIL = 'amitkumarabhinav59@gmail.com';
export function isAdminEmail(email: string) {
  return email.toLowerCase() === ADMIN_EMAIL || (
    process.env.NODE_ENV !== 'production' && email.toLowerCase() === 'seedy@sites.test'
  );
}
export async function requireAdminPage() {
  const user = await requireChatGPTUser('/admin');
  if (!isAdminEmail(user.email)) throw new Error('This account is not authorized to manage the portfolio.');
  return user;
}
export async function requireAdminApi() {
  const user = await getChatGPTUser();
  return user && isAdminEmail(user.email) ? user : null;
}
