export const uploadTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'application/pdf'] as const;
export type UploadType = typeof uploadTypes[number];

const extensionTypes: Record<string, UploadType> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
  pdf: 'application/pdf',
};

export function uploadTypeFor(file: Pick<File, 'name' | 'type'>): UploadType | null {
  const declared = file.type === 'image/jpg' ? 'image/jpeg' : file.type.toLowerCase();
  if (uploadTypes.includes(declared as UploadType)) return declared as UploadType;
  const extension = file.name.toLowerCase().split('.').pop() || '';
  return extensionTypes[extension] || null;
}

export function uploadExtension(type: UploadType) {
  if (type === 'image/jpeg') return 'jpg';
  if (type === 'application/pdf') return 'pdf';
  return type.slice(type.indexOf('/') + 1);
}

export function uploadMaximum(type: UploadType) {
  return type === 'application/pdf' ? 10_000_000 : 8_000_000;
}

export function uploadKind(type: UploadType) {
  return type === 'application/pdf' ? 'resume' : 'image';
}

export function matchesUploadSignature(type: UploadType, bytes: Uint8Array) {
  if (type === 'image/png') return [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a].every((value, index) => bytes[index] === value);
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/webp') return new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF'
    && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP';
  if (type === 'image/avif') {
    const box = new TextDecoder().decode(bytes.slice(4, Math.min(bytes.length, 32)));
    return box.startsWith('ftyp') && (box.includes('avif') || box.includes('avis'));
  }
  const prefix = new TextDecoder().decode(bytes.slice(0, 5));
  const suffix = new TextDecoder().decode(bytes.slice(Math.max(0, bytes.length - 2048)));
  return prefix === '%PDF-' && suffix.includes('%%EOF');
}

export function validPublicBlobUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch { return false; }
}
