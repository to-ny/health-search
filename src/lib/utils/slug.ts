import type { MultilingualText, Language } from '@/server/types/domain';

/**
 * Generate URL-safe slug from text
 * - Lowercase
 * - Replace spaces/special chars with hyphens
 * - Remove accents for URL safety (paracétamol → paracetamol)
 * - Collapse multiple hyphens
 * - Trim leading/trailing hyphens
 */
export function slugify(text: string): string {
  return text
    // Normalize unicode and remove accents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Convert to lowercase
    .toLowerCase()
    // Replace spaces and special chars with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Collapse multiple hyphens
    .replace(/-+/g, '-')
    // Trim leading/trailing hyphens
    .replace(/^-|-$/g, '');
}

/**
 * Generate slug for an entity in a specific language
 * - Uses localized name if available for that exact language
 * - Falls back to ID only if language not available (NO fallback to other languages)
 * - Always appends ID for uniqueness
 */
export function generateEntitySlug(
  name: MultilingualText | null | undefined,
  id: string,
  lang: Language
): string {
  if (!name) return id;

  const localizedName = name[lang]; // Exact language only, no fallback

  if (localizedName) {
    const slugifiedName = slugify(localizedName);
    // If slugified name is empty (e.g., only special chars), return just ID
    return slugifiedName ? `${slugifiedName}-${id}` : id;
  }

  // Language not available - return ID only
  return id;
}

/**
 * Extract ID from slug
 * - For "paracetamol-500mg-5632" → "5632"
 * - For "5632" → "5632"
 * - ID is always the last hyphen-separated segment
 */
export function extractIdFromSlug(slug: string): string {
  const parts = slug.split('-');
  return parts[parts.length - 1];
}

/**
 * Generate slug for a company
 * Companies are not multilingual, just use denomination
 */
export function generateCompanySlug(denomination: string, actorNr: string): string {
  const slugifiedName = slugify(denomination);
  return slugifiedName ? `${slugifiedName}-${actorNr}` : actorNr;
}

/**
 * Generate slug for ATC code
 * Format: {code}-{localized-description} or just {code}
 */
export function generateATCSlug(
  code: string,
  description: MultilingualText | null | undefined,
  lang: Language
): string {
  if (!description) return code;

  const localizedDescription = description[lang];

  if (localizedDescription) {
    const slugifiedDescription = slugify(localizedDescription);
    return slugifiedDescription ? `${code}-${slugifiedDescription}` : code;
  }

  return code;
}

/**
 * Extract ATC code from slug
 * For "N02BE01-paracetamol" → "N02BE01"
 * For "N02BE01" → "N02BE01"
 * ATC code is always first (format: letter + digits + letters + digits)
 */
export function extractATCCodeFromSlug(slug: string): string {
  // ATC codes follow pattern: letter, 2 digits, 2 letters, 2 digits (e.g., N02BE01)
  // But can also be partial: N, N02, N02B, N02BE
  const atcPattern = /^([A-Z][0-9]{0,2}[A-Z]{0,2}[0-9]{0,2})/i;
  const match = slug.toUpperCase().match(atcPattern);
  return match ? match[1] : slug.split('-')[0].toUpperCase();
}
