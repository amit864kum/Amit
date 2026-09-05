'use client';

import { upload } from '@vercel/blob/client';

const extensions: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export async function uploadAdminFile(file: File | null | undefined, current?: string | null) {
  if (!file?.size) return current || null;
  const extension = extensions[file.type];
  const resume = file.type === 'application/pdf';
  const maximum = resume ? 10_000_000 : 8_000_000;
  if (!extension || file.size > maximum) throw new Error('Invalid file');
  const pathname = `${resume ? 'resumes' : 'content'}/${crypto.randomUUID()}.${extension}`;
  const blob = await upload(pathname, file, {
    access: 'public',
    handleUploadUrl: '/api/admin/upload',
    clientPayload: JSON.stringify({ kind: resume ? 'resume' : 'image' }),
    multipart: file.size > 4_000_000,
  });
  const validation = await fetch('/api/admin/upload/validate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: blob.url, type: file.type, size: file.size }),
  });
  if (!validation.ok) throw new Error('Upload validation failed');
  return ((await validation.json()) as { url: string }).url;
}
