'use client';

import { upload } from '@vercel/blob/client';
import { uploadExtension, uploadKind, uploadMaximum, uploadTypeFor } from '@/lib/upload-files';

export async function uploadAdminFile(file: File | null | undefined, current?: string | null) {
  if (!file?.size) return current || null;
  const type = uploadTypeFor(file);
  if (!type) throw new Error('Use a PNG, JPEG, WebP, or AVIF image. Résumés must be PDF files.');
  const maximum = uploadMaximum(type);
  if (file.size > maximum) throw new Error(`The selected file exceeds the ${maximum / 1_000_000} MB upload limit.`);
  const kind = uploadKind(type);
  const extension = uploadExtension(type);
  const normalizedFile = file.type === type ? file : new File([file], file.name, { type, lastModified: file.lastModified });
  const pathname = `${kind === 'resume' ? 'resumes' : 'content'}/${crypto.randomUUID()}.${extension}`;
  let blob: { url: string };
  try {
    blob = await upload(pathname, normalizedFile, {
      access: 'public',
      handleUploadUrl: '/api/admin/upload',
      clientPayload: JSON.stringify({ kind }),
      multipart: file.size > 4_000_000,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (/token|storage|blob|authorization|unauthorized/i.test(message)) {
      throw new Error('Image storage is unavailable. Confirm that Vercel Blob is connected and BLOB_READ_WRITE_TOKEN is configured for this environment.');
    }
    throw new Error(message || 'The file could not be uploaded. Please try again.');
  }
  const validation = await fetch('/api/admin/upload/validate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: blob.url, type, size: file.size }),
  });
  if (!validation.ok) {
    const payload = await validation.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error || 'The uploaded file did not pass validation.');
  }
  return ((await validation.json()) as { url: string }).url;
}
