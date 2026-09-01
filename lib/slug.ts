export function decodePathSegment(value: string) {
  try { return decodeURIComponent(value); }
  catch { return value; }
}

export function toProjectSlug(value: string) {
  return decodePathSegment(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}
