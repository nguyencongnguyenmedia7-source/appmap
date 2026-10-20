/**
 * Vietnamese text processing utilities
 * Normalizes diacritics and tones for flexible search across Vietnam POIs.
 */

export function normalizeVietnamese(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
}

/**
 * Checks if search query matches target text (case-insensitive and accent-insensitive)
 */
export function matchesVietnameseSearch(target: string, query: string): boolean {
  if (!query) return true;
  if (!target) return false;

  const normalizedTarget = normalizeVietnamese(target);
  const normalizedQuery = normalizeVietnamese(query);

  return normalizedTarget.includes(normalizedQuery);
}

/**
 * Creates URL-safe slug from Vietnamese text
 */
export function slugifyVietnamese(text: string): string {
  return normalizeVietnamese(text)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
